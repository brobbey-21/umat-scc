// Vercel serverless entry. Loads the Express app lazily so that boot failures
// (e.g. missing TURSO_DATABASE_URL / dead Turso token) return a readable JSON
// error instead of crashing the invocation with FUNCTION_INVOCATION_FAILED.

let appPromise: Promise<(req: any, res: any) => void> | null = null;

function loadApp() {
  if (!appPromise) {
    appPromise = import('../server/app').then((m) => m.default as (req: any, res: any) => void);
  }
  return appPromise;
}

export default async function handler(req: any, res: any) {
  try {
    const app = await loadApp();
    return app(req, res);
  } catch (err) {
    const detail = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    console.error('SCC server failed to start:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server failed to start', detail });
    }
  }
}
