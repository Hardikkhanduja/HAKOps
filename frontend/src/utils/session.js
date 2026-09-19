/**
 * session.js — Anonymous guest session management.
 *
 * On first visit: calls POST /api/session, gets a UUID, saves it to
 * localStorage. On every later visit: reuses the saved ID.
 *
 * getSessionId() is safe to call from multiple places at once (e.g. two
 * components mounting at the same time) — concurrent calls before the
 * first one resolves will all await the same in-flight request instead
 * of firing multiple POST /api/session calls and racing on localStorage.
 */
const BASE_URL = '/api';
const STORAGE_KEY = 'patientSessionId';

let inFlightRequest = null;

/**
 * Returns the current session ID, creating one via the backend if none
 * exists yet in localStorage.
 * @returns {Promise<string>}
 */
export async function getSessionId() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;

  // Another caller already kicked off session creation — reuse that promise
  // instead of firing a second POST /api/session.
  if (inFlightRequest) return inFlightRequest;

  inFlightRequest = (async () => {
    const res = await fetch(`${BASE_URL}/session`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to create session. Please refresh and try again.');
    const { sessionId } = await res.json();
    localStorage.setItem(STORAGE_KEY, sessionId);
    return sessionId;
  })();

  try {
    return await inFlightRequest;
  } finally {
    inFlightRequest = null;
  }
}