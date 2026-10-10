import { Router, Response } from 'express';
import db from '../db';
import { AuthRequest, requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/denominations — public
router.get('/', async (_req, res: Response) => {
  const result = await db.execute('SELECT * FROM denominations');
  res.json(result.rows);
});

// POST /api/denominations — admin only
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id, name, campusFellowship, shortCode, color, accent, logoText, description, logoImage } = req.body;

  if (!name || !shortCode) {
    return res.status(400).json({ error: 'Name and short code are required' });
  }

  const denomId = id || shortCode.toLowerCase().replace(/[^a-z0-9]/g, '');

  try {
    await db.execute({
      sql: `INSERT INTO denominations (id, name, campusFellowship, shortCode, color, accent, logoText, description, logoImage)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        denomId, name,
        campusFellowship || name,
        shortCode,
        color || '#5C6861',
        accent || '#8C9790',
        logoText || shortCode.slice(0, 2).toUpperCase(),
        description || '',
        logoImage || null
      ],
    });
    const rowResult = await db.execute({ sql: 'SELECT * FROM denominations WHERE id = ?', args: [denomId] });
    res.status(201).json(rowResult.rows[0]);
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Denomination already exists' });
    }
    throw e;
  }
});

// PUT /api/denominations/:id — admin only
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, campusFellowship, shortCode, color, accent, logoText, description, logoImage } = req.body;

  const existingResult = await db.execute({ sql: 'SELECT * FROM denominations WHERE id = ?', args: [id] });
  const existing = existingResult.rows[0] as any;
  if (!existing) return res.status(404).json({ error: 'Denomination not found' });

  await db.execute({
    sql: `UPDATE denominations SET
      name = ?, campusFellowship = ?, shortCode = ?,
      color = ?, accent = ?, logoText = ?, description = ?,
      logoImage = ?
      WHERE id = ?`,
    args: [
      name ?? existing.name,
      campusFellowship ?? existing.campusFellowship,
      shortCode ?? existing.shortCode,
      color ?? existing.color,
      accent ?? existing.accent,
      logoText ?? existing.logoText,
      description ?? existing.description,
      logoImage !== undefined ? logoImage : existing.logoImage,
      id
    ],
  });

  const rowResult = await db.execute({ sql: 'SELECT * FROM denominations WHERE id = ?', args: [id] });
  res.json(rowResult.rows[0]);
});

// DELETE /api/denominations/:id — admin only
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const studentCount = await db.execute({ sql: 'SELECT COUNT(*) as c FROM students WHERE denominationId = ?', args: [req.params.id] });
  const studentC = Number(studentCount.rows[0].c);
  if (studentC > 0) {
    return res.status(409).json({ error: `Cannot delete: ${studentC} students are registered under this fellowship` });
  }

  const adminCount = await db.execute({ sql: 'SELECT COUNT(*) as c FROM denomination_admins WHERE denominationId = ?', args: [req.params.id] });
  const adminC = Number(adminCount.rows[0].c);
  if (adminC > 0) {
    return res.status(409).json({ error: `Cannot delete: ${adminC} admins are assigned to this fellowship` });
  }

  const result = await db.execute({ sql: 'DELETE FROM denominations WHERE id = ?', args: [req.params.id] });
  if (result.rowsAffected === 0) return res.status(404).json({ error: 'Denomination not found' });
  res.json({ message: 'Denomination deleted' });
});

export default router;
