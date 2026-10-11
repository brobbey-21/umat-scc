import { Router, Response } from 'express';
import { randomUUID } from 'crypto';
import db from '../db';
import { AuthRequest, requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/students/count - public, for landing page
router.get('/count', async (_req, res: Response) => {
  const result = await db.execute('SELECT COUNT(*) as count FROM students');
  res.json({ count: Number(result.rows[0].count) });
});

// GET /api/students - admin only
router.get('/', requireAuth, async (_req: AuthRequest, res: Response) => {
  const result = await db.execute('SELECT * FROM students ORDER BY registeredAt DESC');
  res.json(result.rows.map(parseStudentRow));
});

// GET /api/students/:id - admin only
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const result = await db.execute({ sql: 'SELECT * FROM students WHERE id = ?', args: [req.params.id] });
  const row = result.rows[0];
  if (!row) return res.status(404).json({ error: 'Student not found' });
  res.json(parseStudentRow(row));
});

// POST /api/students - public registration
router.post('/', async (req, res: Response) => {
  const {
    fullName, gender, phone, whatsappSameAsPhone,
    programOfStudy, academicLevel, hallOrHostel, roomOrBlock,
    denominationId, homeParishOrCity, prayerRequestOrNotes
  } = req.body;

  if (!fullName || !phone || !programOfStudy || !academicLevel || !hallOrHostel || !denominationId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const denomResult = await db.execute({ sql: 'SELECT * FROM denominations WHERE id = ?', args: [denominationId] });
  const denom = denomResult.rows[0];
  if (!denom) return res.status(400).json({ error: 'Invalid denomination' });

  const id = `stud-${randomUUID().slice(0, 8)}`;
  const registeredAt = new Date().toISOString();

  await db.execute({
    sql: `INSERT INTO students (id, fullName, gender, phone, whatsappSameAsPhone, programOfStudy,
      academicLevel, hallOrHostel, roomOrBlock, denominationId, denominationName, fellowshipCode,
      homeParishOrCity, prayerRequestOrNotes, registeredAt, outreachStatus, outreachNotes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New / Pending', '[]')`,
    args: [
      id, fullName, gender || null, phone, whatsappSameAsPhone ? 1 : 0,
      programOfStudy, academicLevel, hallOrHostel, roomOrBlock || null,
      denominationId, String(denom.name), String(denom.shortCode),
      homeParishOrCity || null, prayerRequestOrNotes || null, registeredAt
    ],
  });

  const rowResult = await db.execute({ sql: 'SELECT * FROM students WHERE id = ?', args: [id] });
  res.status(201).json(parseStudentRow(rowResult.rows[0]));
});

// PATCH /api/students/:id/status - admin only
router.patch('/:id/status', requireAuth, async (req: AuthRequest, res: Response) => {
  const { status, note } = req.body;
  const validStatuses = ['New / Pending', 'Contacted & Welcomed', 'Hostel Visited', 'Added to Fellowship Group'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const existingResult = await db.execute({ sql: 'SELECT * FROM students WHERE id = ?', args: [req.params.id] });
  const existing = existingResult.rows[0] as any;
  if (!existing) return res.status(404).json({ error: 'Student not found' });

  const existingNotes: string[] = JSON.parse(String(existing.outreachNotes || '[]'));
  if (note) existingNotes.unshift(note);

  const contactedAt = new Date().toISOString();

  await db.execute({
    sql: 'UPDATE students SET outreachStatus = ?, outreachNotes = ?, contactedAt = ? WHERE id = ?',
    args: [status, JSON.stringify(existingNotes), contactedAt, req.params.id],
  });

  const rowResult = await db.execute({ sql: 'SELECT * FROM students WHERE id = ?', args: [req.params.id] });
  res.json(parseStudentRow(rowResult.rows[0]));
});

// ── Helpers ─────────────────────────────────────────────────────────────────

function parseStudentRow(row: any) {
  if (!row) return null;
  return {
    ...row,
    whatsappSameAsPhone: !!row.whatsappSameAsPhone,
    outreachNotes: JSON.parse(String(row.outreachNotes || '[]')),
  };
}

export default router;
