import {apiRequest} from './client.js';

export function getNotifications() {
  return apiRequest('/api/notifications');
}

export function markAsRead(notificationId) {
  return apiRequest(`/api/notifications/${notificationId}/read`,
      {method: 'PUT'});
}
