/**
 * JobMatch Lite API
 *
 * Backend API for resume-to-job description matching service.
 */

import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';

// Build the base app with CORS - allow all origins for now
const app = new Elysia()
  .use(
    cors({
      origin: [
        'http://localhost:3000',
        'https://jobmatch-web-mauve.vercel.app',
        process.env.FRONTEND_URL,
      ].filter(Boolean) as string[],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
      credentials: true,
    })
  )
  .get('/', () => ({
    message: 'JobMatch Lite API',
    version: '1.0.0',
  }));

// Load modules dynamically to handle potential import issues
try {
  const { authMiddleware } = await import('./presentation/middleware/auth');
  app.use(authMiddleware);
} catch (e) {
  console.error('Failed to load auth middleware:', e);
}

try {
  const { errorHandler } = await import('./presentation/middleware/error-handler');
  app.use(errorHandler);
} catch (e) {
  console.error('Failed to load error handler:', e);
}

try {
  const { healthModule } = await import('./presentation/modules/health');
  app.use(healthModule);
} catch (e) {
  console.error('Failed to load health module:', e);
}

try {
  const { analysisModule } = await import('./presentation/modules/analysis');
  app.use(analysisModule);
} catch (e) {
  console.error('Failed to load analysis module:', e);
}

try {
  const { historyModule } = await import('./presentation/modules/history');
  app.use(historyModule);
} catch (e) {
  console.error('Failed to load history module:', e);
}

try {
  const { reportModule } = await import('./presentation/modules/report');
  app.use(reportModule);
} catch (e) {
  console.error('Failed to load report module:', e);
}

try {
  const { userModule } = await import('./presentation/modules/user');
  app.use(userModule);
} catch (e) {
  console.error('Failed to load user module:', e);
}

export default app;
