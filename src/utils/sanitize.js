/**
 * HomeHub Security & Sanitization Utilities
 * Protects against Cross-Site Scripting (XSS), HTML Injection, and Malicious Payloads
 */

/**
 * Escapes unsafe HTML characters to prevent XSS execution
 * @param {string} str Unsanitized user string
 * @returns {string} HTML-escaped string
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;');
}

/**
 * Strips all HTML tags and potentially dangerous javascript: URIs
 * @param {string} input Raw text
 * @returns {string} Sanitized plain text
 */
export function sanitizeText(input) {
  if (input === null || input === undefined) return '';
  if (typeof input !== 'string') input = String(input);
  
  // Remove dangerous protocols
  let cleaned = input.replace(/javascript\s*:/gi, '')
                     .replace(/vbscript\s*:/gi, '')
                     .replace(/data\s*:\s*text\/html/gi, '')
                     .replace(/on\w+\s*=/gi, ''); // remove inline event handlers like onclick=

  // Strip HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, '');

  return cleaned.trim();
}

/**
 * Validates and sanitizes email address
 * @param {string} email
 * @returns {string|null} Sanitized email or null if invalid
 */
export function sanitizeEmail(email) {
  if (!email || typeof email !== 'string') return null;
  const clean = email.trim().toLowerCase();
  const isValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(clean);
  return isValid ? clean : null;
}

/**
 * Sanitizes phone numbers to standard safe characters only
 * @param {string} phone
 * @returns {string} Cleaned phone
 */
export function sanitizePhone(phone) {
  if (!phone || typeof phone !== 'string') return '';
  return phone.replace(/[^0-9+\-()\s.]/g, '').slice(0, 25).trim();
}

/**
 * Validates and sanitizes numeric values within bounds
 * @param {any} val
 * @param {number} min
 * @param {number} max
 * @param {number} defaultValue
 * @returns {number}
 */
export function sanitizeNumber(val, min = 0, max = 1000000000, defaultValue = 0) {
  const num = Number(val);
  if (isNaN(num)) return defaultValue;
  if (num < min) return min;
  if (num > max) return max;
  return Math.round(num);
}
