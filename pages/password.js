import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import { requireAdmin } from '../../../lib/auth';

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Both passwords are required' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }

  await connectDB();

  const user = await User.findById(req.user.id).select('+password');
  if (!user) return res.status(404).json({ error: 'User not found' });

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect' });

  user.password = newPassword;
  await user.save();

  return res.status(200).json({ success: true });
}

export default requireAdmin(handler);
