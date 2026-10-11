import { Router, Response } from 'express';
import db from '../db';
import { AuthRequest, requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/hostels - public
router.get('/', async (_req, res: Response) => {
  const result = await db.execute('SELECT * FROM hostels ORDER BY name');
  res.json(result.rows);
});

// POST /api/hostels - admin only
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });

  try {
    const result = await db.execute({ sql: 'INSERT INTO hostels (name) VALUES (?)', args: [name.trim()] });
    const rowResult = await db.execute({ sql: 'SELECT * FROM hostels WHERE id = ?', args: [Number(result.lastInsertRowid)] });
    res.status(201).json(rowResult.rows[0]);
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Hostel already exists' });
    }
    throw e;
  }
});

// DELETE /api/hostels/:id - admin only
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const result = await db.execute({ sql: 'DELETE FROM hostels WHERE id = ?', args: [Number(req.params.id)] });
  if (result.rowsAffected === 0) return res.status(404).json({ error: 'Hostel not found' });
  res.json({ message: 'Hostel deleted' });
});

export default router;
