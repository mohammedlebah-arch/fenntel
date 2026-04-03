export function getSessionId() {
  if (typeof window === 'undefined') return 'ssr';
  let sid = sessionStorage.getItem('fenntel_session');
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('fenntel_session', sid);
  }
  return sid;
}

export async function trackEvent(event, extra = {}) {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, sessionId: getSessionId(), ...extra }),
    });
  } catch {
    // Silent fail — tracking should never block UX
  }
}
