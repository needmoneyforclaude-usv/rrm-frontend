/**
 * NEED-65: adminul seteaza o perioada de mentenanta peste o rezervare
 * confirmata, iar rezervarea trebuie sa fie anulata automat.
 *
 * Datele de test: utilizatorii din RRM.sql (parola 1234).
 */

const RESOURCE_NAME = 'Statie de lucru RTX 4090';
const REASON = 'Test Cypress mentenanta';

/**
 * Un slot liber dintr-o zi lucratoare de peste cateva saptamani, ca testul
 * sa nu se loveasca de rezervarile existente.
 * @return {{day: string, start: string, end: string}}
 */
function futureSlot() {
  const date = new Date();
  date.setDate(date.getDate() + 21 + Math.floor(Math.random() * 60));
  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() + 1);
  }
  const day = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
  const hour = 8 + 2 * Math.floor(Math.random() * 6);
  const pad = (h) => String(h).padStart(2, '0');
  return {
    day,
    start: `${day}T${pad(hour)}:00`,
    end: `${day}T${pad(hour + 2)}:00`,
  };
}

/**
 * @param {string} email
 * @return {!Cypress.Chainable<string>} tokenul JWT
 */
function apiLogin(email) {
  return cy.request('POST', '/api/auth/login', {email, password: '1234'})
      .its('body.token');
}

describe('Mentenanta resurselor (admin)', () => {
  const slot = futureSlot();
  let resource;
  let reservationId;

  before(() => {
    cy.request('/api/resources').then(({body}) => {
      resource = body.find((r) => r.name === RESOURCE_NAME);
      expect(resource, 'resursa de test').to.exist;
    });

    // Team Lead-ul Ion rezerva si confirma resursa pe slotul ales
    apiLogin('ion@usv.ro').then((token) => {
      const auth = {Authorization: `Bearer ${token}`};
      cy.request({
        method: 'POST',
        url: '/api/reservations',
        headers: auth,
        body: {
          resource_id: resource.id,
          start_time: slot.start,
          end_time: slot.end,
        },
      }).then(({body}) => {
        reservationId = body.id;
        cy.request({
          method: 'POST',
          url: `/api/reservations/${reservationId}/confirm`,
          headers: auth,
          body: {purpose: 'Rezervare pentru testul Cypress'},
        }).its('body.status').should('eq', 'CONFIRMED');
      });
    });
  });

  after(() => {
    // stergem perioada de mentenanta creata de test
    apiLogin('admin@usv.ro').then((token) => {
      const auth = {Authorization: `Bearer ${token}`};
      cy.request({url: `/api/resources/${resource.id}/maintenance`,
        headers: auth}).then(({body}) => {
        body.filter((m) => m.reason === REASON).forEach((m) => {
          cy.request({method: 'DELETE', url: `/api/maintenance/${m.id}`,
            headers: auth});
        });
      });
    });
  });

  it('anuleaza rezervarea afectata de mentenanta', () => {
    cy.visit('/login');
    cy.get('input[type=email]').type('admin@usv.ro');
    cy.get('input[type=password]').type('1234');
    cy.get('button[type=submit]').click();
    cy.location('pathname').should('not.eq', '/login');

    cy.visit('/admin/maintenance');
    cy.contains('tr', RESOURCE_NAME)
        .contains('button', 'Seteaza mentenanta')
        .click();

    cy.get('.dialog').within(() => {
      cy.get('input[type=datetime-local]').eq(0).type(`${slot.day}T08:00`);
      cy.get('input[type=datetime-local]').eq(1).type(`${slot.day}T20:00`);
      cy.get('input[type=text]').type(REASON);

      // dialogul arata rezervarea care va fi anulata
      cy.get('.affected-warning').should('contain', '1');
      cy.contains('button', 'Salveaza si anuleaza').click();
    });

    cy.get('.dialog').should('not.exist');

    // rezervarea a fost anulata in backend
    apiLogin('admin@usv.ro').then((token) => {
      cy.request({
        url: `/api/reservations/${reservationId}`,
        headers: {Authorization: `Bearer ${token}`},
      }).its('body.status').should('eq', 'CANCELLED');
    });
  });
});
