import { Router, Response } from 'express';
import { randomUUID } from 'crypto';
import db from '../db';
import { AuthRequest, requireAuth } from '../middleware/auth';

const router = Router();

// All admin routes require auth
router.use(requireAuth);

// GET /api/admins
router.get('/', (_req: AuthRequest, res: Response) => {
  const rows = db.prepare('SELECT * FROM denomination_admins ORDER BY dateAdded DESC').all();
  res.json(rows);
});

// POST /api/admins
router.post('/', (req: AuthRequest, res: Response) => {
  const { denominationId, adminName, roleTitle, phone, email, assignedHalls } = req.body;

  if (!denominationId || !adminName || !roleTitle || !phone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const denom = db.prepare('SELECT * FROM denominations WHERE id = ?').get(denominationId) as any;
  if (!denom) return res.status(400).json({ error: 'Invalid denomination' });

  const id = `admin-${denominationId}-${randomUUID().slice(0, 8)}`;
  const dateAdded = new Date().toISOString().slice(0, 10);

  db.prepare(`
    INSERT INTO denomination_admins (id, denominationId, denominationName, fellowshipCode,
      adminName, roleTitle, phone, email, assignedHalls, dateAdded)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, denominationId, denom.name, denom.shortCode,
    adminName, roleTitle, phone,
    email || `${denominationId}.admin@campus.org`,
    assignedHalls || null, dateAdded
  );

  const row = db.prepare('SELECT * FROM denomination_admins WHERE id = ?').get(id);
  res.status(201).json(row);
});

// DELETE /api/admins/:id
router.delete('/:id', (req: AuthRequest, res: Response) => {
  const result = db.prepare('DELETE FROM denomination_admins WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Admin not found' });
  }
  res.json({ message: 'Admin deleted' });
});

export default router;
