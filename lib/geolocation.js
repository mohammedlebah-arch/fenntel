/**
 * Geolocation — resolves a visitor IP to a country name
 * Uses ip-api.com (free, no key needed, 45 req/min)
 * Falls back gracefully to 'Unknown' on any error
 */

const cache = new Map(); // in-memory cache to avoid repeat lookups

export async function getCountryFromIp(ip) {
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168') || ip.startsWith('10.')) {
    return 'Local';
  }

  if (cache.has(ip)) return cache.get(ip);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000); // 3s timeout

    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (!res.ok) return 'Unknown';

    const data = await res.json();
    const country = data.status === 'success' ? data.country : 'Unknown';

    cache.set(ip, country);
    // Clear cache after 1 hour to avoid memory leaks
    setTimeout(() => cache.delete(ip), 60 * 60 * 1000);

    return country;
  } catch {
    return 'Unknown';
  }
}
