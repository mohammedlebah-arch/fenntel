/**
 * ONE-TIME endpoint to create the initial admin account.
 * Protected by ADMIN_SETUP_KEY env var.
 * Should be disabled or deleted after first use.
 */
import connectDB from '../lib/mongodb';
import User from '../models/User';
import { sanitizeEmail } from '../lib/sanitize';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const setupKey = process.env.ADMIN_SETUP_KEY;
  if (!setupKey) return res.status(403).json({ error: 'Setup disabled' });

  const { key, email, password } = req.body;
  if (key !== setupKey) return res.status(403).json({ error: 'Invalid setup key' });

  const cleanEmail = sanitizeEmail(email);
  if (!cleanEmail) return res.status(400).json({ error: 'Invalid email' });
  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    await connectDB();

    const existing = await User.findOne({});
    if (existing) return res.status(409).json({ error: 'Admin already exists. Setup disabled.' });

    await User.create({ email: cleanEmail, password, role: 'admin' });
    return res.status(201).json({ success: true, message: 'Admin created. Delete this endpoint.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
    }
