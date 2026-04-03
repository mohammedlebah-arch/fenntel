# FENNTEL — Premium Digital Store

> Production-ready e-commerce app for selling psychology & self-mastery ebooks.
> Built with Next.js 14, MongoDB, TailwindCSS, 2Checkout payments, Brevo emails.

---

## ⚡ Quick Start (Local)

```bash
# 1. Install dependencies
npm install

# 2. Copy env file
cp .env.example .env.local
# → Fill in your values (see below)

# 3. Seed database (creates admin + sample products)
npm run seed

# 4. Run
npm run dev
```

Store → http://localhost:3000  
Admin → http://localhost:3000/YOUR_ADMIN_SECRET_PATH/login

---

## 🔐 Environment Variables

Edit `.env.local`:

```env
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/fenntel

# JWT secret — minimum 32 random characters
JWT_SECRET=change_this_to_something_random_32chars_min

# One-time key to create first admin account
ADMIN_SETUP_KEY=any_random_key_you_pick

# YOUR SECRET ADMIN URL — only you know this
# Admin will be at: yoursite.com/YOUR_VALUE/login
# Example: ADMIN_SECRET_PATH=yassine-x9k2
ADMIN_SECRET_PATH=change-this-to-something-only-you-know

# 2Checkout credentials
TWOCHECKOUT_MERCHANT_CODE=your_merchant_code
TWOCHECKOUT_SECRET_KEY=your_secret_key
TWOCHECKOUT_SANDBOX=true

# Brevo (email)
BREVO_API_KEY=your_brevo_api_key
EMAIL_FROM=noreply@fenntel.com
EMAIL_FROM_NAME=Yassine from Fenntel

# Your site URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Download link expiry (hours)
DOWNLOAD_EXPIRY_HOURS=24
```

---

## 👤 Creating the Admin Account

**Option A — npm run seed (recommended for first time):**
```bash
npm run seed
# Creates: admin@fenntel.com / Fenntel@2024!
# ⚠️ Change password immediately after first login
```

**Option B — API call:**
```bash
curl -X POST http://localhost:3000/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"key":"YOUR_ADMIN_SETUP_KEY","email":"you@email.com","password":"StrongPass123!"}'
```

Then login at:
```
http://localhost:3000/YOUR_ADMIN_SECRET_PATH/login
```

---

## 🔒 Secret Admin URL

Nobody can access your admin panel without knowing your secret path.

- `/admin/*` → returns 404 (blocked by middleware)
- `/YOUR_SECRET_PATH/*` → protected by JWT

Set it in `.env.local`:
```
ADMIN_SECRET_PATH=yassine-portal-9x2k
```

Admin login: `yoursite.com/yassine-portal-9x2k/login`

**Never share this URL.**

---

## 💳 2Checkout Setup

1. Sign up at https://sandbox.2checkout.com
2. Get Merchant Code + Secret Key
3. Add to `.env.local`
4. Set `TWOCHECKOUT_SANDBOX=true` for testing
5. For production: set to `false` and use live credentials
6. Add your callback URL in 2CO dashboard:
   ```
   https://yoursite.com/api/payment/callback
   https://yoursite.com/api/payment/webhook
   ```

---

## 📧 Brevo Email Setup

1. Sign up at https://brevo.com (free: 300 emails/day)
2. Settings → SMTP & API → API Keys → Create Key
3. Add to `.env.local`: `BREVO_API_KEY=your_key`
4. Verify your sender email in Brevo dashboard

Emails sent automatically:
- ✅ Purchase confirmation + download link
- ✅ Day 1 follow-up ("did you start reading?")
- ✅ Day 3 follow-up (with upsell to Book 2)

---

## 📚 Adding Your Ebook Files

Place PDF files in `/private-files/`:
```
private-files/
  unbeatable-mind-book1.pdf
  unbeatable-mind-book2.pdf
  unbeatable-mind-bundle.pdf
```

Files are **never publicly accessible** — served only through
`/download/[token]` after payment verification.

**On Vercel:** Vercel has a read-only filesystem. Options:
1. Use Vercel Blob Storage (simplest)
2. Use Cloudinary or S3 — update `/pages/download/[token].js`

---

## 🚀 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Or connect GitHub repo at vercel.com for auto-deploy.

**Add all env variables in:**  
Vercel Dashboard → Project → Settings → Environment Variables

**Then create your admin:**
```bash
curl -X POST https://yoursite.vercel.app/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"key":"YOUR_SETUP_KEY","email":"you@email.com","password":"StrongPass!"}'
```

---

## 📁 Project Structure

```
fenntel/
├── components/
│   ├── AdminLayout.js      ← Sidebar (uses secret path dynamically)
│   ├── BuyModal.js         ← Email input + checkout flow
│   ├── FloatingOrbs.js     ← 3D gold background orbs
│   ├── GoldButton.js       ← Button with particle burst
│   └── ProductCard.js      ← Product card with animations
├── lib/
│   ├── auth.js             ← JWT sign/verify + requireAdmin()
│   ├── email.js            ← Brevo: purchase, day1, day3 emails
│   ├── mongodb.js          ← DB connection singleton
│   ├── particles.js        ← Silver/gold bubble animation
│   ├── rateLimit.js        ← Login brute-force protection
│   ├── sanitize.js         ← XSS + NoSQL injection prevention
│   └── session.js          ← Analytics session tracking
├── middleware.js            ← Edge middleware: blocks /admin, protects secret path
├── models/
│   ├── Analytics.js        ← Visitor/click events
│   ├── Download.js         ← Secure download tokens (TTL indexed)
│   ├── Order.js            ← Customer orders
│   ├── Product.js          ← Product catalog
│   ├── Settings.js         ← Site settings (key-value)
│   └── User.js             ← Admin users (bcrypt)
├── pages/
│   ├── [adminPath]/        ← Secret admin (only YOUR path works)
│   │   ├── login.js
│   │   ├── dashboard.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   └── settings.js
│   ├── api/
│   │   ├── auth/           ← login, logout, me, setup
│   │   ├── products/       ← CRUD + click + AI recommend
│   │   ├── orders/         ← create + list
│   │   ├── payment/        ← initiate, callback, webhook
│   │   ├── analytics/      ← track + dashboard
│   │   └── settings/       ← get/set + password
│   ├── download/[token].js ← Secure file delivery
│   ├── success.js          ← Post-payment thank you
│   └── index.js            ← Public storefront
├── private-files/          ← Your PDF ebooks (never public)
├── public/uploads/         ← Product + author images
└── scripts/seed.js         ← Database seeder
```

---

## 🛡️ Security Summary

| Feature | Implementation |
|---|---|
| Password hashing | bcrypt (12 rounds) |
| Auth tokens | JWT in HTTP-only cookies |
| Admin URL | Secret path via env var |
| /admin path | Blocked → 404 |
| Login brute-force | Rate limit: 5 attempts / 15 min |
| Input sanitization | validator.js on all endpoints |
| NoSQL injection | Operator key stripping |
| File delivery | Token-gated, never public |
| Download tokens | 96-char random hex, expires 24h |
| Security headers | X-Frame, X-XSS, Referrer-Policy |

---

## 🧠 AI Recommendations

Collaborative filtering — finds what sessions co-clicked:
1. User clicks Product A → system finds all sessions that also clicked A
2. Ranks what those sessions clicked next
3. Shows top 3 as "You might also like"
4. Falls back to: session history → top clicked globally

---

*FENNTEL — Built for Yassine Lebah*
