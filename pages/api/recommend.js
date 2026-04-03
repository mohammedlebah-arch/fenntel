import connectDB from '../lib/mongodb';
import Product from '../models/Product';
import Analytics from '../models/Analytics';
import { isValidObjectId } from '../lib/sanitize';

/**
 * Simple collaborative-filtering recommendations:
 * 1. Find all sessions that clicked this product
 * 2. Find what other products those sessions clicked
 * 3. Rank by frequency — most co-clicked = most relevant
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { productId, sessionId } = req.query;

  await connectDB();

  try {
    let recommendedIds = [];

    // Strategy 1: Co-click based (collaborative filtering)
    if (productId && isValidObjectId(productId)) {
      const sessions = await Analytics.distinct('sessionId', {
        product: productId,
        event: 'product_click',
      });

      if (sessions.length > 0) {
        const coClicks = await Analytics.aggregate([
          {
            $match: {
              sessionId: { $in: sessions },
              event: 'product_click',
              product: { $ne: null, $exists: true },
            },
          },
          { $group: { _id: '$product', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 4 },
        ]);
        recommendedIds = coClicks
          .map((c) => c._id.toString())
          .filter((id) => id !== productId);
      }
    }

    // Strategy 2: Session-based (what this visitor clicked)
    if (sessionId && recommendedIds.length < 3) {
      const sessionClicks = await Analytics.distinct('product', {
        sessionId,
        event: 'product_click',
      });
      recommendedIds = [...new Set([...recommendedIds, ...sessionClicks.map(String)])];
    }

    // Strategy 3: Fallback — top clicked products
    if (recommendedIds.length < 3) {
      const top = await Product.find({ active: true })
        .sort({ clickCount: -1 })
        .limit(4)
        .select('_id')
        .lean();
      const topIds = top.map((p) => p._id.toString());
      recommendedIds = [...new Set([...recommendedIds, ...topIds])];
    }

    // Fetch final recommendations (exclude current product)
    const products = await Product.find({
      _id: { $in: recommendedIds.slice(0, 4) },
      active: true,
      ...(productId && isValidObjectId(productId) ? { _id: { $ne: productId, $in: recommendedIds.slice(0, 4) } } : {}),
    })
      .limit(3)
      .lean();

    return res.status(200).json({ recommendations: products });
  } catch (err) {
    console.error('Recommendation error:', err);
    return res.status(500).json({ recommendations: [] });
  }
}
