import {apiRequest} from './client.js';

export function getTeamReservations(status) {
  return apiRequest('/api/reservations', {params: {status}});
}

export function cancelReservation(reservationId, reason) {
  return apiRequest(`/api/reservations/${reservationId}/cancel`,
      {method: 'POST', body: {reason: reason || null}});
}

export function getAvailability(resourceId, week) {
  return apiRequest('/api/reservations/availability',
      {params: {resource_id: resourceId, week}});
}

export function createReservation(data) {
  return apiRequest('/api/reservations', {method: 'POST', body: data});
}

export function quoteReservation(data) {
  return apiRequest('/api/reservations/quote', {method: 'POST', body: data});
}

export function approveReservation(reservationId) {
  return apiRequest(`/api/reservations/${reservationId}/approve`,
      {method: 'POST'});
}

export function rejectReservation(reservationId, reason) {
  return apiRequest(`/api/reservations/${reservationId}/reject`,
      {method: 'POST', body: {reason: reason || null}});
}

export function getAllReservations(
    {status, resourceId, teamId, dateFrom, dateTo} = {}) {
  return apiRequest('/api/reservations', {
    params: {
      status,
      resource_id: resourceId,
      team_id: teamId,
      date_from: dateFrom,
      date_to: dateTo,
    },
  });
}
