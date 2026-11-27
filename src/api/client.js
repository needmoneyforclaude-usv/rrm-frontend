const TOKEN_KEY = 'rrm_token';

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function formatDetail(detail) {
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join('; ');
  }
  return detail || 'A aparut o eroare';
}

export async function apiRequest(path, {method = 'GET', body, params} = {}) {
  const query = params ?
    '?' + new URLSearchParams(
        Object.entries(params).filter(([, value]) => value != null &&
          value !== ''),
    ) :
    '';
  const headers = {};
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(path + query, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (response.status === 204) {
    return null;
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(response.status, formatDetail(data?.detail));
  }
  return data;
}
