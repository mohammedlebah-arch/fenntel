import connectDB from '../../../lib/mongodb';
import Analytics from '../../../models/Analytics';
import Order from '../../../models/Order';
import { requireAdmin } from '../../../lib/auth';

async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  await connectDB();

  const [
    totalVisitors,
    totalClicks,
    totalSales,
    completedOrders,
    countryData,
    dailyVisits,
  ] = await Promise.all([
    // Unique sessions = unique visitors
    Analytics.distinct('sessionId', { event: 'pageview' }).then((s) => s.length),
    // Total product clicks
    Analytics.countDocuments({ event: 'product_click' }),
    // Completed purchases count
    Order.countDocuments({ status: 'completed' }),
    // Recent orders
    Order.find({ status: 'completed' })
      .populate('product', 'title price')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    // Top countries
    Analytics.aggregate([
      { $match: { event: 'pageview', country: { $ne: 'Unknown' } } },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    // Visits per day (last 14 days)
    Analytics.aggregate([
      {
        $match: {
          event: 'pageview',
          createdAt: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return res.status(200).json({
    totalVisitors,
    totalClicks,
    totalSales,
    completedOrders,
    countryData,
    dailyVisits,
  });
}

export default requireAdmin(handler);
