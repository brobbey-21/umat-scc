import 'dotenv/config';
import app from './app';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`[SCC Server] Listening on http://localhost:${PORT}`);
  console.log(`[SCC Server] API base: http://localhost:${PORT}/api`);
});
