import {apiRequest, saveToken} from './client.js';

export async function login(email, password) {
  const data = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: {email, password},
  });
  saveToken(data.token);
  return data.user;
}

export function register(data) {
  return apiRequest('/api/auth/register', {method: 'POST', body: data});
}

export function getTeams() {
  return apiRequest('/api/teams');
}
