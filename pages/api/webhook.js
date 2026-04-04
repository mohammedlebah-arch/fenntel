import connectDB from '../../lib/mongodb';
import Order from '../../models/Order';
import Product from '../../models/Product';
import Download from '../../models/Download';
import Analytics from '../../models/Analytics';
import { sendDownloadEmail } from '../../lib/email';
import crypto from 'crypto';

export const config = { api: { bodyParser: true } };

/**
 * 2Checkout IPN Webhook
 * POST /api/payment/webhook
 *
 * Called by 2Checkout when a payment is approved.
 * We verify the signature, mark the order complete,
 * generate a secure download token, and email the customer.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  await connectDB();

  const body = req.body;
  const {
    REFNO,           // 2CO sale ID
    REFNOEXT,        // Our merchant_order_id
    PAYMENTTYPE,
    ORDERSTATUS,
    IPN_PID,
    IPN_PNAME,
    IPN_PRICE,
    IPN_DATE,
    HASH,
  } = body;

  // ── Verify HMAC signature ─────────────────────────────────────
  const SECRET_KEY = process.env.TWOCHECKOUT_SECRET_KEY;
  const SANDBOX = process.env.TWOCHECKOUT_SANDBOX === 'true';

  if (SECRET_KEY && HASH && !SANDBOX) {
    // 2CO HMAC-MD5 verification
    // See: https://knowledgecenter.2checkout.com/2Checkout-Classic/IPN
    const hmacData = [IPN_PID, IPN_PNAME, IPN_PRICE, IPN_DATE]
      .map((v) => (v ? `${String(v).length}${v}` : '0'))
      .join('');
    const expectedHash = crypto
      .createHmac('md5', SECRET_KEY)
      .update(hmacData)
      .digest('hex');

    if (expectedHash.toUpperCase() !== (HASH || '').toUpperCase()) {
      console.error('❌ 2CO IPN signature mismatch');
      return res.status(400).send('INVALID');
    }
  }

  // ── Only process COMPLETE/APPROVED orders ─────────────────────
  const isApproved = ORDERSTATUS === 'COMPLETE' || ORDERSTATUS === 'APPROVED' || SANDBOX;
  if (!isApproved) {
    console.log('IPN received but status:', ORDERSTATUS);
    return res.status(200).send('OK');
  }

  try {
    const orderId = REFNOEXT;
    if (!orderId) return res.status(200).send('OK');

    // Find and update order
    const order = await Order.findById(orderId);
    if (!order) return res.status(200).send('OK');
    if (order.status === 'completed') return res.status(200).send('OK'); // idempotent

    order.status = 'completed';
    order.paymentId = REFNO || 'WEBHOOK';
    await order.save();

    // Increment product sales
    const product = await Product.findByIdAndUpdate(
      order.product,
      { $inc: { salesCount: 1 } },
      { new: true }
    );

    // Track purchase event
    await Analytics.create({
      sessionId: order.sessionId || 'webhook',
      event: 'purchase',
      product: order.product,
    }).catch(() => {});

    // ── Generate secure download token ───────────────────────────
    const EXPIRY_HOURS = parseInt(process.env.DOWNLOAD_EXPIRY_HOURS) || 24;
    const token = crypto.randomBytes(48).toString('hex'); // 96-char unguessable token
    const expiresAt = new Date(Date.now() + EXPIRY_HOURS * 60 * 60 * 1000);

    // Map product to its file
    const filePath = getFileForProduct(product);

    const download = await Download.create({
      token,
      customerEmail: order.customerEmail,
      product: order.product,
      productTitle: product?.title || order.productSnapshot?.title,
      filePath,
      orderId: order._id,
      expiresAt,
      maxDownloads: 3,
    });

    // ── Send email with download link ────────────────────────────
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://fenntel.com';
    const downloadUrl = `${APP_URL}/download/${token}`;

    await sendDownloadEmail({
      to: order.customerEmail,
      productTitle: download.productTitle,
      downloadUrl,
      expiresIn: EXPIRY_HOURS,
    });

    console.log(`✅ Order ${orderId} complete — download email sent to ${order.customerEmail}`);
    return res.status(200).send('OK');
  } catch (err) {
    console.error('Webhook error:', err);
    // Always return 200 to 2CO so it doesn't retry infinitely
    return res.status(200).send('OK');
  }
}

/**
 * Map a product to its private file path.
 * Files live in /private-files/ (never served publicly).
 * Add your actual book filenames here.
 */
function getFileForProduct(product) {
  if (!product) return 'sample.pdf';

  const title = (product.title || '').toLowerCase();

  if (title.includes('bundle')) return 'unbeatable-mind-bundle.pdf';
  if (title.includes('external') || title.includes('book 2') || title.includes('2')) {
    return 'unbeatable-mind-book2.pdf';
  }
  // Default: Book 1
  return 'unbeatable-mind-book1.pdf';
  }
