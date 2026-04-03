import connectDB from '../../../lib/mongodb';
import Order from '../../../models/Order';
import { sanitizeEmail, isValidObjectId } from '../../../lib/sanitize';
import crypto from 'crypto';

/**
 * 2Checkout / Verifone payment integration
 * Docs: https://knowledgecenter.2checkout.com/
 * This generates the redirect URL + signature for 2CO hosted checkout
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { orderId } = req.body;
  if (!isValidObjectId(orderId)) return res.status(400).json({ error: 'Invalid order ID' });

  await connectDB();

  const order = await Order.findById(orderId).populate('product');
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.status !== 'pending') return res.status(400).json({ error: 'Order already processed' });

  const MERCHANT_CODE = process.env.TWOCHECKOUT_MERCHANT_CODE;
  const SECRET_KEY = process.env.TWOCHECKOUT_SECRET_KEY;
  const SANDBOX = process.env.TWOCHECKOUT_SANDBOX === 'true';

  if (!MERCHANT_CODE || !SECRET_KEY) {
    return res.status(500).json({ error: 'Payment gateway not configured' });
  }

  const baseUrl = SANDBOX
    ? 'https://sandbox.2checkout.com/checkout/purchase'
    : 'https://www.2checkout.com/checkout/purchase';

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Build 2CO parameters
  const params = {
    sid: MERCHANT_CODE,
    mode: '2CO',
    li_0_type: 'product',
    li_0_name: order.productSnapshot.title.slice(0, 128),
    li_0_price: order.productSnapshot.price.toFixed(2),
    li_0_quantity: '1',
    card_holder_name: order.customerEmail.split('@')[0],
    email: order.customerEmail,
    merchant_order_id: order._id.toString(),
    currency_code: order.productSnapshot.currency || 'USD',
    x_receipt_link_url: `${appUrl}/api/payment/callback`,
    x_cancel_url: `${appUrl}/?payment=cancelled`,
    demo: SANDBOX ? 'Y' : 'N',
  };

  // Generate MD5 signature: secret + sid + merchant_order_id + li_0_price
  const rawSignature = `${SECRET_KEY}${MERCHANT_CODE}${params.merchant_order_id}${params.li_0_price}`;
  params.x_md5_hash = crypto.createHash('md5').update(rawSignature).digest('hex');

  // Build redirect URL
  const queryString = new URLSearchParams(params).toString();
  const checkoutUrl = `${baseUrl}?${queryString}`;

  return res.status(200).json({ checkoutUrl, orderId: order._id });
}
