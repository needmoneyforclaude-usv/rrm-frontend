import {useCallback, useEffect, useState} from 'react';
import {Link, useOutletContext} from 'react-router-dom';
import {getTeams} from '../api/auth.js';
import {getToken} from '../api/client.js';
import {getTeamReservations} from '../api/reservations.js';
import CancelReservationDialog from
  '../components/CancelReservationDialog.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import {
  formatHours,
  formatPrice,
  formatShortDay,
  reservationCode,
} from '../utils/format.js';

const FILTERS = [
  {value: '', label: 'Toate'},
  {value: 'PENDING', label: 'In asteptare'},
  {value: 'CONFIRMED', label: 'Confirmate'},
  {value: 'CANCELLED', label: 'Anulate'},
];

export default function TeamReservationsPage() {
  const {user} = useOutletContext();
  const [status, setStatus] = useState('');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [toCancel, setToCancel] = useState(null);
  const [teamName, setTeamName] = useState('');

  const loadReservations = useCallback(() => {
    setLoading(true);
    return getTeamReservations(status)
        .then((data) => {
          setReservations(data);
          setError('');
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => {
    if (getToken()) {
      loadReservations();
    }
  }, [loadReservations]);

  const canCancel = (reservation) =>
    user?.role === 'LEAD' &&
    ['PENDING', 'CONFIRMED'].includes(reservation.status) &&
    new Date(reservation.start_time) > new Date();

  useEffect(() => {
    if (!user?.team_id) {
      return;
    }
    getTeams()
        .then((teams) => {
          const team = teams.find((t) => t.id === user.team_id);
          setTeamName(team ? team.name : '');
        })
        .catch(() => null);
  }, [user?.team_id]);

  const handleCancelled = async () => {
    setToCancel(null);
    setSuccess('Rezervarea a fost anulata. Echipa a fost notificata.');
    await loadReservations();
  };

  if (!getToken()) {
    return (
      <p className="message">
        Trebuie sa fii autentificat ca sa vezi rezervarile echipei.
      </p>
    );
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Rezervarile echipei</h1>
          {teamName && <p className="muted small">Echipa {teamName}</p>}
        </div>
        <Link to="/" className="btn">Rezervare noua</Link>
      </div>
      <div className="category-filter">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            className={status === filter.value ? 'chip chip-active' : 'chip'}
            onClick={() => setStatus(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>
      {error && <p className="message message-error">{error}</p>}
      {success && <p className="message message-success">{success}</p>}
      {loading ? (
        <p className="muted">Se incarca rezervarile...</p>
      ) : reservations.length === 0 ? (
        <p className="message">Echipa nu are rezervari.</p>
      ) : (
        <div className="card table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Resursa</th>
                <th>Zi</th>
                <th>Interval</th>
                <th>Pret final</th>
                <th>Stare</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td>{reservationCode(reservation.id)}</td>
                  <td>{reservation.resource_name}</td>
                  <td>{formatShortDay(reservation.start_time)}</td>
                  <td>
                    {formatHours(reservation.start_time, reservation.end_time)}
                  </td>
                  <td>
                    {reservation.final_price != null ?
                      formatPrice(reservation.final_price) :
                      '-'}
                    {reservation.discount > 0 && (
                      <span className="muted"> (-{reservation.discount}%)</span>
                    )}
                  </td>
                  <td><StatusBadge status={reservation.status} /></td>
                  <td className="table-actions">
                    {canCancel(reservation) ? (
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setSuccess('');
                          setToCancel(reservation);
                        }}
                      >
                        Anuleaza
                      </button>
                    ) : (
                      <span className="muted">&mdash;</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {toCancel && (
        <CancelReservationDialog
          reservation={toCancel}
          onClose={() => setToCancel(null)}
          onCancelled={handleCancelled}
        />
      )}
      {user && user.role !== 'LEAD' && (
        <p className="muted">Doar Team Lead-ul poate anula rezervari.</p>
      )}
    </section>
  );
}
