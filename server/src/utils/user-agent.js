export function parseUserAgent(ua) {
  if (!ua) return 'Unknown Device';
  if (ua.includes('Windows')) return 'Windows PC';
  if (ua.includes('Macintosh') || ua.includes('Mac OS')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux PC';
  if (ua.includes('Android')) return 'Android Device';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS Device';
  return 'Web Browser';
}
