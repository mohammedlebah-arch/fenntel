import validator from 'validator';

/**
 * Strip HTML tags and trim whitespace
 */
export function sanitizeString(str, maxLength = 500) {
  if (typeof str !== 'string') return '';
  return validator.escape(str.trim()).slice(0, maxLength);
}

/**
 * Validate and normalize an email address
 */
export function sanitizeEmail(email) {
  if (typeof email !== 'string') return null;
  const normalized = validator.normalizeEmail(email.trim());
  if (!normalized || !validator.isEmail(normalized)) return null;
  return normalized;
}

/**
 * Sanitize a price value
 */
export function sanitizePrice(val) {
  const n = parseFloat(val);
  if (isNaN(n) || n < 0) return null;
  return Math.round(n * 100) / 100; // 2 decimal places
}

/**
 * Validate MongoDB ObjectId format
 */
export function isValidObjectId(id) {
  return /^[a-f\d]{24}$/i.test(id);
}

/**
 * Strip any MongoDB operator keys ($gt, $where, etc.)
 */
export function sanitizeQuery(obj) {
  if (typeof obj !== 'object' || obj === null) return {};
  const clean = {};
  for (const key of Object.keys(obj)) {
    if (!key.startsWith('$')) {
      clean[key] = typeof obj[key] === 'object' ? sanitizeQuery(obj[key]) : obj[key];
    }
  }
  return clean;
}
