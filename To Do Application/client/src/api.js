// src/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001/api';

export async function apiFetch(endpoint, method = 'GET', body = null, token = null) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include', // Ensure cookies/session sent!
  };
  if (body) opts.body = JSON.stringify(body);

  // Avoid double slash if endpoint starts with '/'
  const url = endpoint.startsWith('/') ? `${API_URL}${endpoint}` : `${API_URL}/${endpoint}`;
  const res = await fetch(url, opts);

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const msg = data?.error || data?.message || res.statusText || `Error ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  return data;
}
