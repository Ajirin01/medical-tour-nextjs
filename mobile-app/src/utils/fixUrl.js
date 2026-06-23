/**
 * fixUrl.js
 * Rewrites any insecure or local-IP resource URLs to the production HTTPS API URL.
 * This handles the case where profile images and other assets were uploaded while
 * the server was running locally (e.g. http://192.168.1.200:5000/uploads/...) and
 * their absolute URLs are stored in the database.
 */

const PRODUCTION_BASE = 'https://api.sozodigicare.com';

// Patterns that indicate a local/insecure origin
const LOCAL_PATTERNS = [
  /^http:\/\/192\.168\.\d+\.\d+:\d+/,
  /^http:\/\/localhost:\d+/,
  /^http:\/\/127\.0\.0\.1:\d+/,
  /^http:\/\/10\.\d+\.\d+\.\d+:\d+/,
];

/**
 * Given a URL string (typically from the database), returns a safe HTTPS URL.
 * If the URL is already HTTPS or relative, it is returned as-is.
 * If it matches a known local pattern, the origin is replaced with PRODUCTION_BASE.
 *
 * @param {string|null|undefined} url
 * @returns {string}
 */
export const fixUrl = (url) => {
  if (!url || typeof url !== 'string') return url;

  // Already safe
  if (url.startsWith('https://')) return url;

  // Relative path – prefix with production base
  if (url.startsWith('/')) return `${PRODUCTION_BASE}${url}`;

  // Replace known local/insecure origins with the production base
  for (const pattern of LOCAL_PATTERNS) {
    if (pattern.test(url)) {
      return url.replace(pattern, PRODUCTION_BASE);
    }
  }

  return url;
};

/**
 * Returns a safe socket base URL (no /medical-tourism path prefix).
 * Strips any path segment from the API URL so socket.io connects to the root.
 *
 * @returns {string}
 */
export const getSocketUrl = () => {
  const apiUrl = process.env.EXPO_PUBLIC_GLOBAL_API_URL || PRODUCTION_BASE;
  try {
    const { origin } = new URL(apiUrl);
    return origin;
  } catch {
    return PRODUCTION_BASE;
  }
};
