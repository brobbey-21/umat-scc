import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'scc-sanctuary-ledger-secret-change-in-production';

export interface AuthRequest extends Request {
  adminPassword?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { adminPassword: string };
    req.adminPassword = payload.adminPassword;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function signToken(adminPassword: string): string {
  return jwt.sign({ adminPassword }, JWT_SECRET, { expiresIn: '12h' });
}

export { JWT_SECRET };
