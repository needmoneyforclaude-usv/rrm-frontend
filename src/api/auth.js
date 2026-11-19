import {apiRequest, saveToken} from './client.js';

/**
 * Login; tokenul primit se salveaza in localStorage.
 * @param {string} email
 * @param {string} password
 * @return {!Promise<Object>} userul logat
 */
export async function login(email, password) {
  const data = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: {email, password},
  });
  saveToken(data.token);
  return data.user;
}

/**
 * @param {{name: string, email: string, password: string,
 *     team_id: ?number, affiliation_date: ?string}} data
 * @return {!Promise<Object>}
 */
export function register(data) {
  return apiRequest('/api/auth/register', {method: 'POST', body: data});
}

/** @return {!Promise<!Array<Object>>} */
export function getTeams() {
  return apiRequest('/api/teams');
}
