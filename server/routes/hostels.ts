import { Router, Response } from 'express';
import db from '../db';
import { AuthRequest, requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/hostels — public
router.get('/', (_req, res: Response) => {
  const rows = db.prepare('SELECT * FROM hostels ORDER BY name').all();
  res.json(rows);
});

// POST /api/hostels — admin only
router.post('/', requireAuth, (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });

  try {
    const result = db.prepare('INSERT INTO hostels (name) VALUES (?)').run(name.trim());
    const row = db.prepare('SELECT * FROM hostels WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(row);
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Hostel already exists' });
    }
    throw e;
  }
});

// DELETE /api/hostels/:id — admin only
router.delete('/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const result = db.prepare('DELETE FROM hostels WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Hostel not found' });
  res.json({ message: 'Hostel deleted' });
});

export default router;
