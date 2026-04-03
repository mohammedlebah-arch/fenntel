import connectDB from '../lib/mongodb';
import Order from '../models/Order';
import Product from '../models/Product';
import Analytics from '../models/Analytics';
import crypto from 'crypto';

export default async function handler(req, res) {
  // 2CO sends POST for IPN, GET for return redirect
  await connectDB();

  const body = req.method === 'POST' ? req.body : req.query;

  const {
    merchant_order_id,
    order_number,
    total,
    key: tcoKey,
    sale_id,
  } = body;

  if (!merchant_order_id) {
    return res.redirect(302, '/?payment=error');
  }

  // Verify 2CO signature
  const SECRET_KEY = process.env.TWOCHECKOUT_SECRET_KEY;
  const MERCHANT_CODE = process.env.TWOCHECKOUT_MERCHANT_CODE;
  const SANDBOX = process.env.TWOCHECKOUT_SANDBOX === 'true';

  if (SECRET_KEY && tcoKey) {
    const rawSignature = `${SECRET_KEY}${MERCHANT_CODE}${sale_id || order_number}${total}`;
    const expectedKey = crypto.createHash('md5').update(rawSignature).digest('hex').toUpperCase();
    const receivedKey = (tcoKey || '').toUpperCase();

    if (!SANDBOX && expectedKey !== receivedKey) {
      console.error('2CO signature mismatch');
      return res.status(400).json({ error: 'Invalid signature' });
    }
  }

  try {
    const order = await Order.findById(merchant_order_id);
    if (order && order.status === 'pending') {
      order.status = 'completed';
      order.paymentId = sale_id || order_number || 'SANDBOX';
      await order.save();

      // Increment product sales count
      await Product.findByIdAndUpdate(order.product, { $inc: { salesCount: 1 } });

      // Track purchase event
      await Analytics.create({
        sessionId: order.sessionId || 'anonymous',
        event: 'purchase',
        product: order.product,
        ip: req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress,
      });
    }
  } catch (err) {
    console.error('Callback processing error:', err);
  }

  // For IPN (POST) — respond 200
  if (req.method === 'POST') return res.status(200).send('OK');

  // For return redirect (GET) — send to success page
  return res.redirect(302, `/?payment=success&order=${merchant_order_id}`);
    }
