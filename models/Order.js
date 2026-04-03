import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    customerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productSnapshot: {
      title: String,
      price: Number,
      currency: String,
    },
    paymentId: {
      type: String,
      default: null,
    },
    paymentProvider: {
      type: String,
      enum: ['2checkout', 'manual', 'test'],
      default: '2checkout',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    customerCountry: {
      type: String,
      default: 'Unknown',
    },
    customerIp: {
      type: String,
      default: null,
    },
    sessionId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

OrderSchema.index({ customerEmail: 1 });
OrderSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
