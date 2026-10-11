import { config } from 'dotenv';
config({ path: ['.env.local', '.env'] });
import express from 'express';
import db, { bootError } from './db';
import authRoutes from './routes/auth';
import studentRoutes from './routes/students';
import adminRoutes from './routes/admins';
import denominationRoutes from './routes/denominations';
import hostelRoutes from './routes/hostels';
import courseRoutes from './routes/courses';

const app = express();

// ── Middleware ───────────────────────────────────────────────────────────────

app.use(express.json({ limit: '10mb' }));

// CORS for development (Vite runs on a different port)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
  });
}

// ── API Routes ──────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/denominations', denominationRoutes);
app.use('/api/hostels', hostelRoutes);
app.use('/api/courses', courseRoutes);

// Health check — pings the database so misconfiguration is visible here

app.get('/api/health', async (_req, res) => {
  if (bootError) {
    return res.status(503).json({
      status: 'error',
      database: bootError,
      timestamp: new Date().toISOString(),
    });
  }
  try {
    await db.execute('SELECT 1');
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch (e: any) {
    res.status(503).json({ status: 'error', database: e?.message || 'unreachable', timestamp: new Date().toISOString() });
  }
});

// JSON error handler — surface real errors (e.g. Turso auth failures) instead
// of an opaque 500
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('API error:', err);
  if (res.headersSent) return;
  res.status(500).json({ error: err?.message || 'Internal server error' });
});

export default app;
