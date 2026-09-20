const STORAGE_KEY = 'careSetuSession';

export function saveAuthSession(sessionId, user) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      sessionId,
      user,
    })
  );
}

export function getAuthSession() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function getSessionId() {
  const session = getAuthSession();

  if (!session?.sessionId) {
    throw new Error('Please log in to continue.');
  }

  return session.sessionId;
}

export function getCurrentUser() {
  return getAuthSession()?.user || null;
}

export function clearAuthSession() {
  localStorage.removeItem(STORAGE_KEY);
}
