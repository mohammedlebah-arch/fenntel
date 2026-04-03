import mongoose from 'mongoose';

const DownloadSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productTitle: String,
    // Path to the actual file (relative to /private-files/)
    filePath: {
      type: String,
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    usedAt: {
      type: Date,
      default: null,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    maxDownloads: {
      type: Number,
      default: 3, // Allow up to 3 downloads (in case of browser issues)
    },
  },
  { timestamps: true }
);

// Auto-expire documents (TTL index — MongoDB removes them automatically)
DownloadSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Download || mongoose.model('Download', DownloadSchema);
