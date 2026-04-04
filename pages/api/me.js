import { requireAdmin } from '../../lib/auth';

async function handler(req, res) {
  return res.status(200).json({ user: req.user });
}

export default requireAdmin(handler);
