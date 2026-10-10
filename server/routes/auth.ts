import { Router, Request, Response } from 'express';
import { signToken } from '../middleware/auth';

const router = Router();

router.post('/login', (req: Request, res: Response) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  const adminPassword = process.env.ADMIN_PASSWORD || 'scc-admin-2026';
  if (password !== adminPassword) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const token = signToken(adminPassword);
  return res.json({ token, message: 'Login successful' });
});

export default router;
