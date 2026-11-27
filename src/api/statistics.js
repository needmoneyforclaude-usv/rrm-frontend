import {apiRequest} from './client.js';

export function getWeekStatistics(week) {
  return apiRequest('/api/statistics', {params: {week}});
}
