import { Router, Response } from 'express';
import { randomUUID } from 'crypto';
import db from '../db';
import { AuthRequest, requireAuth } from '../middleware/auth';

const router = Router();

// All admin routes require auth
router.use(requireAuth);

// GET /api/admins
router.get('/', async (_req: AuthRequest, res: Response) => {
  const result = await db.execute('SELECT * FROM denomination_admins ORDER BY dateAdded DESC');
  res.json(result.rows);
});

// POST /api/admins
router.post('/', async (req: AuthRequest, res: Response) => {
  const { denominationId, adminName, roleTitle, phone, email, assignedHalls } = req.body;

  if (!denominationId || !adminName || !roleTitle || !phone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const denomResult = await db.execute({ sql: 'SELECT * FROM denominations WHERE id = ?', args: [denominationId] });
  const denom = denomResult.rows[0];
  if (!denom) return res.status(400).json({ error: 'Invalid denomination' });

  const id = `admin-${denominationId}-${randomUUID().slice(0, 8)}`;
  const dateAdded = new Date().toISOString().slice(0, 10);

  await db.execute({
    sql: `INSERT INTO denomination_admins (id, denominationId, denominationName, fellowshipCode,
      adminName, roleTitle, phone, email, assignedHalls, dateAdded)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id, denominationId, String(denom.name), String(denom.shortCode),
      adminName, roleTitle, phone,
      email || `${denominationId}.admin@campus.org`,
      assignedHalls || null, dateAdded
    ],
  });

  const rowResult = await db.execute({ sql: 'SELECT * FROM denomination_admins WHERE id = ?', args: [id] });
  res.status(201).json(rowResult.rows[0]);
});

// DELETE /api/admins/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const result = await db.execute({ sql: 'DELETE FROM denomination_admins WHERE id = ?', args: [req.params.id] });
  if (result.rowsAffected === 0) {
    return res.status(404).json({ error: 'Admin not found' });
  }
  res.json({ message: 'Admin deleted' });
});

export default router;
