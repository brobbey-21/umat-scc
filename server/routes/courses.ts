import { Router, Response } from 'express';
import db from '../db';
import { AuthRequest, requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/courses — public
router.get('/', async (_req, res: Response) => {
  const result = await db.execute('SELECT * FROM courses ORDER BY name');
  res.json(result.rows);
});

// POST /api/courses — admin only
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });

  try {
    const result = await db.execute({ sql: 'INSERT INTO courses (name) VALUES (?)', args: [name.trim()] });
    const rowResult = await db.execute({ sql: 'SELECT * FROM courses WHERE id = ?', args: [Number(result.lastInsertRowid)] });
    res.status(201).json(rowResult.rows[0]);
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Course already exists' });
    }
    throw e;
  }
});

// DELETE /api/courses/:id — admin only
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const result = await db.execute({ sql: 'DELETE FROM courses WHERE id = ?', args: [Number(req.params.id)] });
  if (result.rowsAffected === 0) return res.status(404).json({ error: 'Course not found' });
  res.json({ message: 'Course deleted' });
});

export default router;
