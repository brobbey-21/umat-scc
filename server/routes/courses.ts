import { Router, Response } from 'express';
import db from '../db';
import { AuthRequest, requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/courses — public
router.get('/', (_req, res: Response) => {
  const rows = db.prepare('SELECT * FROM courses ORDER BY name').all();
  res.json(rows);
});

// POST /api/courses — admin only
router.post('/', requireAuth, (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });

  try {
    const result = db.prepare('INSERT INTO courses (name) VALUES (?)').run(name.trim());
    const row = db.prepare('SELECT * FROM courses WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(row);
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Course already exists' });
    }
    throw e;
  }
});

// DELETE /api/courses/:id — admin only
router.delete('/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const result = db.prepare('DELETE FROM courses WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Course not found' });
  res.json({ message: 'Course deleted' });
});

export default router;
