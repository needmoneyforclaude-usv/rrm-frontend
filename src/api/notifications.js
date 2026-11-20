import {apiRequest} from './client.js';

/** @return {!Promise<!Array<Object>>} notificarile userului logat */
export function getNotifications() {
  return apiRequest('/api/notifications');
}

/**
 * @param {number} notificationId
 * @return {!Promise<Object>}
 */
export function markAsRead(notificationId) {
  return apiRequest(`/api/notifications/${notificationId}/read`,
      {method: 'PUT'});
}
