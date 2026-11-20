import {apiRequest} from './client.js';

/**
 * Statisticile saptamanii care contine ziua data (doar admin).
 * @param {string=} week 'YYYY-MM-DD'
 * @return {!Promise<Object>}
 */
export function getWeekStatistics(week) {
  return apiRequest('/api/statistics', {params: {week}});
}
