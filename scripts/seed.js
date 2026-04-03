/**
 * FENNTEL — Seed Script
 * Run: node scripts/seed.js
 *
 * Creates:
 * - Admin user
 * - Sample products
 * - Default settings
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌  MONGODB_URI not set in .env.local');
  process.exit(1);
}

// ── Inline schemas (avoid ESM issues in seed script) ─────────────
const UserSchema = new mongoose.Schema({
  email: String, password: String, role: { type: String, default: 'admin' }
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  title: String, description: String, price: Number, currency: { type: String, default: 'USD' },
  image: { type: String, default: '/placeholder-book.jpg' }, category: String,
  active: { type: Boolean, default: true }, clickCount: { type: Number, default: 0 }, salesCount: { type: Number, default: 0 },
}, { timestamps: true });

const SettingsSchema = new mongoose.Schema({ key: String, value: mongoose.Schema.Types.Mixed }, { timestamps: true });

const User     = mongoose.models.User     || mongoose.model('User',     UserSchema);
const Product  = mongoose.models.Product  || mongoose.model('Product',  ProductSchema);
const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅  Connected to MongoDB');

  // ── Admin user ────────────────────────────────────────────────
  const existingAdmin = await User.findOne({ role: 'admin' });
  if (!existingAdmin) {
    const hashedPw = await bcrypt.hash('fenntel2024!', 12);
    await User.create({ email: 'admin@fenntel.com', password: hashedPw, role: 'admin' });
    console.log('✅  Admin created → admin@fenntel.com / fenntel2024!');
  } else {
    console.log('ℹ️   Admin already exists, skipping');
  }

  // ── Sample products ───────────────────────────────────────────
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany([
      {
        title: 'Master Yourself First',
        description: 'A deep dive into Adlerian psychology — understand your drives, overcome inferiority, and build unshakeable confidence from the inside out.',
        price: 9.99,
        category: 'Self-Mastery',
        image: '/placeholder-book.jpg',
        clickCount: 42,
        salesCount: 8,
      },
      {
        title: 'Build Your External Life',
        description: 'From inner transformation to outer architecture. Relationships, career, environment — build a life that reflects who you are becoming.',
        price: 14.99,
        category: 'Life Design',
        image: '/placeholder-book.jpg',
        clickCount: 27,
        salesCount: 5,
      },
      {
        title: 'The Unbeatable Mind — Complete Series',
        description: 'Both volumes in one. The full Unbeatable Mind journey: from self-knowledge to world mastery. For those who are serious about transformation.',
        price: 19.99,
        category: 'Bundle',
        image: '/placeholder-book.jpg',
        clickCount: 63,
        salesCount: 12,
      },
    ]);
    console.log('✅  3 sample products created');
  } else {
    console.log(`ℹ️   ${count} products already exist, skipping`);
  }

  // ── Default settings ──────────────────────────────────────────
  const defaults = [
    { key: 'subtitle',    value: 'Welcome to Fenntel, where coffee, music, and books meet.' },
    { key: 'authorName',  value: 'Yassine Lebah' },
    { key: 'authorBio',   value: 'Author, thinker, and digital creator. Yassine Lebah writes at the intersection of psychology, philosophy, and personal mastery — distilling complex ideas into powerful, actionable books.' },
    { key: 'authorImage', value: '/author.jpg' },
  ];

  for (const s of defaults) {
    await Settings.findOneAndUpdate({ key: s.key }, { value: s.value }, { upsert: true });
  }
  console.log('✅  Default settings saved');

  await mongoose.disconnect();
  console.log('\n🎉  Seed complete! Run: npm run dev');
}

seed().catch((err) => { console.error(err); process.exit(1); });
