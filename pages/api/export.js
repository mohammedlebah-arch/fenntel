import connectDB from '../../lib/mongodb';
import Order from '../../models/Order';
import { requireAdmin } from '../../lib/auth';

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  await connectDB();

  const orders = await Order.find({})
    .populate('product', 'title price')
    .sort({ createdAt: -1 })
    .lean();

  // Build CSV
  const headers = ['Order ID', 'Date', 'Customer Email', 'Product', 'Price', 'Currency', 'Status', 'Country', 'Payment ID'];

  const rows = orders.map((o) => [
    o._id.toString(),
    new Date(o.createdAt).toISOString().slice(0, 19).replace('T', ' '),
    o.customerEmail,
    o.productSnapshot?.title || o.product?.title || '',
    o.productSnapshot?.price?.toFixed(2) || '',
    o.productSnapshot?.currency || 'USD',
    o.status,
    o.customerCountry || 'Unknown',
    o.paymentId || '',
  ]);

  const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\r\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="fenntel-orders-${Date.now()}.csv"`);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).send('\uFEFF' + csv); // BOM for Excel UTF-8
}

export default requireAdmin(handler);
