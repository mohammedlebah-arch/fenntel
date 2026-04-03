import mongoose from 'mongoose';

const AnalyticsSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    event: {
      type: String,
      enum: ['pageview', 'product_click', 'buy_click', 'checkout_start', 'purchase'],
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    country: {
      type: String,
      default: 'Unknown',
    },
    userAgent: {
      type: String,
      default: null,
    },
    ip: {
      type: String,
      default: null,
    },
    referrer: {
      type: String,
      default: null,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

AnalyticsSchema.index({ event: 1, createdAt: -1 });
AnalyticsSchema.index({ createdAt: -1 });

export default mongoose.models.Analytics || mongoose.model('Analytics', AnalyticsSchema);
