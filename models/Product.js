import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP'],
    },
    image: {
      type: String, // relative path or URL
      default: '/placeholder-book.jpg',
    },
    category: {
      type: String,
      trim: true,
      default: 'Ebook',
    },
    tags: [{ type: String, trim: true, maxlength: 50 }],
    active: {
      type: Boolean,
      default: true,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    salesCount: {
      type: Number,
      default: 0,
    },
    // For AI recommendations: stores which products were bought together
    coClickedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
);

ProductSchema.index({ active: 1, clickCount: -1 });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
