import connectDB from '../../../lib/mongodb';
import Analytics from '../../../models/Analytics';
import { isValidObjectId } from '../../../lib/sanitize';
import { getCountryFromIp } from '../../../lib/geolocation';

const ALLOWED_EVENTS = ['pageview', 'product_click', 'buy_click', 'checkout_start', 'purchase'];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { event, sessionId, productId, meta } = req.body;

  if (!ALLOWED_EVENTS.includes(event)) return res.status(400).json({ error: 'Invalid event' });
  if (!sessionId || typeof sessionId !== 'string') return res.status(400).json({ error: 'sessionId required' });

  await connectDB();

  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
  const country = await getCountryFromIp(ip?.trim());

  await Analytics.create({
    sessionId: sessionId.slice(0, 64),
    event,
    product: productId && isValidObjectId(productId) ? productId : null,
    country,
    ip: ip?.slice(0, 45),
    userAgent: req.headers['user-agent']?.slice(0, 200),
    referrer: req.headers.referer?.slice(0, 200),
    meta: typeof meta === 'object' ? meta : {},
  });

  return res.status(200).json({ success: true });
}
