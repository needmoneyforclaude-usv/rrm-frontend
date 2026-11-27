import {apiRequest} from './client.js';

export function getAffectedReservations(resourceId, startTime, endTime) {
  return apiRequest(
      `/api/resources/${resourceId}/maintenance/affected-reservations`,
      {params: {start_time: startTime, end_time: endTime}});
}

export function createMaintenance(resourceId, data) {
  return apiRequest(`/api/resources/${resourceId}/maintenance`,
      {method: 'POST', body: data});
}
