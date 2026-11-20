import {apiRequest} from './client.js';

/**
 * Rezervarile echipei utilizatorului logat.
 * @param {?string=} status PENDING, CONFIRMED sau CANCELLED
 * @return {!Promise<!Array<Object>>}
 */
export function getTeamReservations(status) {
  return apiRequest('/api/reservations', {params: {status}});
}

/**
 * @param {number} reservationId
 * @param {string=} reason motivul anularii (optional)
 * @return {!Promise<Object>}
 */
export function cancelReservation(reservationId, reason) {
  return apiRequest(`/api/reservations/${reservationId}/cancel`,
      {method: 'POST', body: {reason: reason || null}});
}

/**
 * Sloturile de cate o ora din saptamana care contine ziua data.
 * @param {number|string} resourceId
 * @param {string} week data in format 'YYYY-MM-DD'
 * @return {!Promise<!Array<Object>>}
 */
export function getAvailability(resourceId, week) {
  return apiRequest('/api/reservations/availability',
      {params: {resource_id: resourceId, week}});
}

/**
 * Creeaza rezervarea in starea PENDING (raspunsul contine pretul).
 * @param {{resource_id: number, start_time: string, end_time: string}} data
 * @return {!Promise<Object>}
 */
export function createReservation(data) {
  return apiRequest('/api/reservations', {method: 'POST', body: data});
}

/**
 * @param {number} reservationId
 * @param {string=} purpose scopul rezervarii (optional)
 * @return {!Promise<Object>}
 */
export function confirmReservation(reservationId, purpose) {
  return apiRequest(`/api/reservations/${reservationId}/confirm`,
      {method: 'POST', body: {purpose: purpose || null}});
}
