// Vercel serverless entry point. vercel.json rewrites every /api/* request here,
// and the Express app routes it using the original URL.
import app from '../server/app.js';

export default app;
