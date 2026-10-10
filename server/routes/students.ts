import { Router, Response } from 'express';
import { randomUUID } from 'crypto';
import db from '../db';
import { AuthRequest, requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/students/count — public, for landing page
router.get('/count', (_req, res: Response) => {
  const row = db.prepare('SELECT COUNT(*) as count FROM students').get() as { count: number };
  res.json({ count: row.count });
});

// GET /api/students — admin only
router.get('/', requireAuth, (_req: AuthRequest, res: Response) => {
  const rows = db.prepare('SELECT * FROM students ORDER BY registeredAt DESC').all();
  const students = rows.map(parseStudentRow);
  res.json(students);
});

// GET /api/students/:id — admin only
router.get('/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const row = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Student not found' });
  res.json(parseStudentRow(row));
});

// POST /api/students — public registration
router.post('/', (req, res: Response) => {
  const {
    fullName, gender, phone, whatsappSameAsPhone,
    programOfStudy, academicLevel, hallOrHostel, roomOrBlock,
    denominationId, denominationName, fellowshipCode,
    homeParishOrCity, prayerRequestOrNotes
  } = req.body;

  if (!fullName || !phone || !programOfStudy || !academicLevel || !hallOrHostel || !denominationId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const denom = db.prepare('SELECT * FROM denominations WHERE id = ?').get(denominationId) as any;
  if (!denom) return res.status(400).json({ error: 'Invalid denomination' });

  const id = `stud-${randomUUID().slice(0, 8)}`;
  const registeredAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO students (id, fullName, gender, phone, whatsappSameAsPhone, programOfStudy,
      academicLevel, hallOrHostel, roomOrBlock, denominationId, denominationName, fellowshipCode,
      homeParishOrCity, prayerRequestOrNotes, registeredAt, outreachStatus, outreachNotes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New / Pending', '[]')
  `).run(
    id, fullName, gender || null, phone, whatsappSameAsPhone ? 1 : 0,
    programOfStudy, academicLevel, hallOrHostel, roomOrBlock || null,
    denominationId, denom.name, denom.shortCode,
    homeParishOrCity || null, prayerRequestOrNotes || null, registeredAt
  );

  const row = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
  res.status(201).json(parseStudentRow(row));
});

// PATCH /api/students/:id/status — admin only
router.patch('/:id/status', requireAuth, (req: AuthRequest, res: Response) => {
  const { status, note } = req.body;
  const validStatuses = ['New / Pending', 'Contacted & Welcomed', 'Hostel Visited', 'Added to Fellowship Group'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const existing = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id) as any;
  if (!existing) return res.status(404).json({ error: 'Student not found' });

  const existingNotes: string[] = JSON.parse(existing.outreachNotes || '[]');
  if (note) existingNotes.unshift(note);

  const contactedAt = new Date().toISOString();

  db.prepare(`
    UPDATE students SET outreachStatus = ?, outreachNotes = ?, contactedAt = ? WHERE id = ?
  `).run(status, JSON.stringify(existingNotes), contactedAt, req.params.id);

  const row = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
  res.json(parseStudentRow(row));
});

// ── Helpers ─────────────────────────────────────────────────────────────────

function parseStudentRow(row: any) {
  if (!row) return null;
  return {
    ...row,
    whatsappSameAsPhone: !!row.whatsappSameAsPhone,
    outreachNotes: JSON.parse(row.outreachNotes || '[]'),
  };
}

export default router;
