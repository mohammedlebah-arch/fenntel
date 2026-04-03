/**
 * Simple in-memory rate limiter.
 * Works on serverless (per-instance) — for multi-instance prod,
 * replace store with Redis (Upstash).
 *
 * Login: max 5 attempts per 15 minutes per IP
 */

const store = new Map(); // ip → { count, resetAt }

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

export function checkRateLimit(ip) {
  const now = Date.now();
  const key = ip || 'unknown';

  let record = store.get(key);

  // Expired window — reset
  if (!record || now > record.resetAt) {
    record = { count: 0, resetAt: now + WINDOW_MS };
  }

  record.count += 1;
  store.set(key, record);

  // Clean up old entries every 100 calls
  if (store.size > 500) {
    for (const [k, v] of store.entries()) {
      if (now > v.resetAt) store.delete(k);
    }
  }

  if (record.count > MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return {
      allowed: false,
      retryAfter,
      message: `Too many login attempts. Try again in ${Math.ceil(retryAfter / 60)} minutes.`,
    };
  }

  return { allowed: true, remaining: MAX_ATTEMPTS - record.count };
}

export function resetRateLimit(ip) {
  store.delete(ip || 'unknown');
}
