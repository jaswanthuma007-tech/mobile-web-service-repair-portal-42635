const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

// PUBLIC_INTERFACE
export async function submitRepairRequest(payload) {
  /** Submit a new repair request to the backend. */
  const res = await fetch(`${API_BASE_URL}/api/repairs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || 'Failed to submit repair request');
  }
  return data;
}

// PUBLIC_INTERFACE
export async function adminLogin(username, password) {
  /** Authenticate admin and receive bearer token. */
  const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || 'Invalid credentials');
  }
  return data;
}

// PUBLIC_INTERFACE
export async function listRepairs(token) {
  /** Retrieve repair requests list (admin protected). */
  const res = await fetch(`${API_BASE_URL}/api/repairs`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || 'Failed to load repairs');
  }
  return data;
}
