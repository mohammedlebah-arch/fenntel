import connectDB from '../lib/mongodb';
import User from '../models/User';
import { signToken, getTokenCookieOptions } from '../lib/auth';
import { sanitizeEmail } from '../lib/sanitize';
import { checkRateLimit, resetRateLimit } from '../lib/rateLimit';
import { serialize } from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // ── Rate limiting ────────────────────────────────────────────
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'unknown';
  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    res.setHeader('Retry-After', limit.retryAfter);
    return res.status(429).json({ error: limit.message });
  }

  try {
    await connectDB();

    const { email, password } = req.body;

    // Sanitize inputs
    const cleanEmail = sanitizeEmail(email);
    if (!cleanEmail) return res.status(400).json({ error: 'Invalid email' });
    if (!password || typeof password !== 'string' || password.length < 1) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Find user (explicitly select password)
    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user) {
      // Constant time response to prevent user enumeration
      await new Promise((r) => setTimeout(r, 500));
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // Clear rate limit on success
    resetRateLimit(ip);

    const token = signToken({ id: user._id, email: user.email, role: user.role });

    // Set HTTP-only cookie
    const cookieOptions = getTokenCookieOptions();
    res.setHeader(
      'Set-Cookie',
      serialize('fenntel_token', token, cookieOptions)
    );

    return res.status(200).json({
      success: true,
      user: { email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
