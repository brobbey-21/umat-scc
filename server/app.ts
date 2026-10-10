import 'dotenv/config';
import express from 'express';
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

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
