// Vercel function entry. Bundled into api/index.js by `npm run build:api`
// (esbuild) so the deployed function is a single self-contained file —
// Vercel does not resolve cross-file TypeScript imports like ../server/app.
import app from './app';

export default app;
