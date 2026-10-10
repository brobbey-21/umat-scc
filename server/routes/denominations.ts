import { Router, Response } from 'express';
import db from '../db';
import { AuthRequest, requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/denominations — public
router.get('/', (_req, res: Response) => {
  const rows = db.prepare('SELECT * FROM denominations').all();
  res.json(rows);
});

// POST /api/denominations — admin only
router.post('/', requireAuth, (req: AuthRequest, res: Response) => {
  const { id, name, campusFellowship, shortCode, color, accent, logoText, description, logoImage } = req.body;

  if (!name || !shortCode) {
    return res.status(400).json({ error: 'Name and short code are required' });
  }

  const denomId = id || shortCode.toLowerCase().replace(/[^a-z0-9]/g, '');

  try {
    db.prepare(`
      INSERT INTO denominations (id, name, campusFellowship, shortCode, color, accent, logoText, description, logoImage)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      denomId, name,
      campusFellowship || name,
      shortCode,
      color || '#5C6861',
      accent || '#8C9790',
      logoText || shortCode.slice(0, 2).toUpperCase(),
      description || '',
      logoImage || null
    );
    const row = db.prepare('SELECT * FROM denominations WHERE id = ?').get(denomId);
    res.status(201).json(row);
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Denomination already exists' });
    }
    throw e;
  }
});

// PUT /api/denominations/:id — admin only
router.put('/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, campusFellowship, shortCode, color, accent, logoText, description, logoImage } = req.body;

  const existing = db.prepare('SELECT * FROM denominations WHERE id = ?').get(id) as any;
  if (!existing) return res.status(404).json({ error: 'Denomination not found' });

  db.prepare(`
    UPDATE denominations SET
      name = ?, campusFellowship = ?, shortCode = ?,
      color = ?, accent = ?, logoText = ?, description = ?,
      logoImage = ?
    WHERE id = ?
  `).run(
    name ?? existing.name,
    campusFellowship ?? existing.campusFellowship,
    shortCode ?? existing.shortCode,
    color ?? existing.color,
    accent ?? existing.accent,
    logoText ?? existing.logoText,
    description ?? existing.description,
    logoImage !== undefined ? logoImage : existing.logoImage,
    id
  );

  const row = db.prepare('SELECT * FROM denominations WHERE id = ?').get(id);
  res.json(row);
});

// DELETE /api/denominations/:id — admin only
router.delete('/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const studentCount = db.prepare('SELECT COUNT(*) as c FROM students WHERE denominationId = ?').get(req.params.id) as any;
  if (studentCount.c > 0) {
    return res.status(409).json({ error: `Cannot delete: ${studentCount.c} students are registered under this fellowship` });
  }

  const adminCount = db.prepare('SELECT COUNT(*) as c FROM denomination_admins WHERE denominationId = ?').get(req.params.id) as any;
  if (adminCount.c > 0) {
    return res.status(409).json({ error: `Cannot delete: ${adminCount.c} admins are assigned to this fellowship` });
  }

  const result = db.prepare('DELETE FROM denominations WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Denomination not found' });
  res.json({ message: 'Denomination deleted' });
});

export default router;
