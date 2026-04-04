import connectDB from '../../lib/mongodb';
import Product from '../../models/Product';
import Analytics from '../../models/Analytics';
import { isValidObjectId } from '../../lib/sanitize';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { productId, sessionId } = req.body;
  if (!isValidObjectId(productId)) return res.status(400).json({ error: 'Invalid product ID' });

  await connectDB();

  // Increment click count
  await Product.findByIdAndUpdate(productId, { $inc: { clickCount: 1 } });

  // Record analytics event
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
  await Analytics.create({
    sessionId: sessionId || 'anonymous',
    event: 'product_click',
    product: productId,
    userAgent: req.headers['user-agent']?.slice(0, 200),
    ip: ip?.slice(0, 45),
    referrer: req.headers.referer?.slice(0, 200),
  });

  return res.status(200).json({ success: true });
    }
