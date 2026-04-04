import connectDB from '../../lib/mongodb';
import Product from '../../models/Product';
import { requireAdmin } from '../../lib/auth';
import { sanitizeString, sanitizePrice, isValidObjectId } from '../../lib/sanitize';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';

export const config = { api: { bodyParser: false } };

async function parseForm(req) {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: (parseInt(process.env.UPLOAD_MAX_SIZE_MB) || 5) * 1024 * 1024,
    filter: ({ mimetype }) => mimetype && mimetype.startsWith('image/'),
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

async function handler(req, res) {
  const { id } = req.query;
  if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid product ID' });

  await connectDB();

  // ── GET single product (public) ──────────────────────────────
  if (req.method === 'GET') {
    const product = await Product.findById(id).lean();
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.status(200).json({ product });
  }

  // ── PUT update product (admin) ───────────────────────────────
  if (req.method === 'PUT') {
    let fields, files;
    try {
      ({ fields, files } = await parseForm(req));
    } catch {
      return res.status(400).json({ error: 'File upload error' });
    }

    const updates = {};
    if (fields.title) updates.title = sanitizeString(fields.title?.[0] || fields.title, 200);
    if (fields.description) updates.description = sanitizeString(fields.description?.[0] || fields.description, 2000);
    if (fields.price) {
      const p = sanitizePrice(fields.price?.[0] || fields.price);
      if (p === null) return res.status(400).json({ error: 'Invalid price' });
      updates.price = p;
    }
    if (fields.category) updates.category = sanitizeString(fields.category?.[0] || fields.category, 100);
    if (fields.active !== undefined) {
      const active = fields.active?.[0] || fields.active;
      updates.active = active === 'true' || active === true;
    }

    const file = files.image?.[0] || files.image;
    if (file) updates.image = `/uploads/${path.basename(file.filepath)}`;

    const product = await Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.status(200).json({ product });
  }

  // ── DELETE product (admin) ───────────────────────────────────
  if (req.method === 'DELETE') {
    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default function routeHandler(req, res) {
  if (req.method === 'GET') return handler(req, res);
  return requireAdmin(handler)(req, res);
  }
