/**
 * Lightweight and safe User-Agent parser to extract OS and Browser name.
 */
export function parseUserAgent(userAgent?: string | null): string {
  if (!userAgent) return 'Web Session (Unknown Device)';

  let browser = 'Web Browser';
  let os = 'Unknown OS';

  // Detect OS
  if (/windows/i.test(userAgent)) {
    os = 'Windows';
  } else if (/macintosh|mac os x/i.test(userAgent)) {
    os = 'macOS';
  } else if (/android/i.test(userAgent)) {
    os = 'Android';
  } else if (/iphone|ipad|ipod/i.test(userAgent)) {
    os = 'iOS';
  } else if (/linux/i.test(userAgent)) {
    os = 'Linux';
  }

  // Detect Browser
  if (/edg/i.test(userAgent)) {
    browser = 'Microsoft Edge';
  } else if (/chrome|crios/i.test(userAgent) && !/opr|opera/i.test(userAgent)) {
    browser = 'Google Chrome';
  } else if (/firefox|fxios/i.test(userAgent)) {
    browser = 'Mozilla Firefox';
  } else if (/safari/i.test(userAgent) && !/chrome|crios/i.test(userAgent)) {
    browser = 'Apple Safari';
  } else if (/opr|opera/i.test(userAgent)) {
    browser = 'Opera';
  }

  return `${browser} on ${os}`;
}
