const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

/**
 * Centralized fetch wrapper for backend calls.
 * Ensures consistent headers, credential mode, and error parsing.
 */
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    // Include cookies/credentials if the backend ever uses them; harmless for bearer-only auth.
    credentials: 'include',
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }
  return data;
}

// PUBLIC_INTERFACE
export async function submitRepairRequest(payload) {
  /** Submit a new repair request to the backend. */
  return apiFetch('/api/repairs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

// PUBLIC_INTERFACE
export async function adminLogin(username, password) {
  /** Authenticate admin and receive bearer token. */
  return apiFetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
}

// PUBLIC_INTERFACE
export async function listRepairs(token) {
  /** Retrieve repair requests list (admin protected). */
  return apiFetch('/api/repairs', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
