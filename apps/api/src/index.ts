/**
 * JobMatch Lite API
 *
 * Backend API for resume-to-job description matching service.
 */

import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { openapi } from '@elysiajs/openapi';

// Build the base app with CORS and OpenAPI
const app = new Elysia()
  .use(
    openapi({
      documentation: {
        info: {
          title: 'JobMatch Lite API',
          version: '1.0.0',
          description: 'Resume-to-job description matching API with AI-powered analysis',
        },
        tags: [
          { name: 'Analysis', description: 'Resume analysis endpoints' },
          { name: 'History', description: 'Analysis history endpoints' },
          { name: 'Report', description: 'PDF report generation' },
          { name: 'Auth', description: 'Authentication endpoints' },
          { name: 'User', description: 'User management endpoints' },
          { name: 'Health', description: 'Health check' },
        ],
      },
    })
  )
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
    docs: '/openapi',
  }));

// Load modules dynamically to handle potential import issues
try {
  const { authMiddleware } = await import('./presentation/middleware/auth');
  app.use(authMiddleware);
  console.log('✅ Auth middleware loaded');
} catch (e) {
  console.error('❌ Failed to load auth middleware:', e);
}

try {
  const { errorHandler } = await import('./presentation/middleware/error-handler');
  app.use(errorHandler);
  console.log('✅ Error handler loaded');
} catch (e) {
  console.error('❌ Failed to load error handler:', e);
}

try {
  const { healthModule } = await import('./presentation/modules/health');
  app.use(healthModule);
  console.log('✅ Health module loaded');
} catch (e) {
  console.error('❌ Failed to load health module:', e);
}

try {
  const { analysisModule } = await import('./presentation/modules/analysis');
  app.use(analysisModule);
  console.log('✅ Analysis module loaded');
} catch (e) {
  console.error('❌ Failed to load analysis module:', e);
  // Fallback route with helpful error
  app.post('/api/analyze', () => ({
    success: false,
    error: { code: 'MODULE_LOAD_ERROR', message: 'Analysis module failed to load. Check server logs.' }
  }));
}

try {
  const { historyModule } = await import('./presentation/modules/history');
  app.use(historyModule);
  console.log('✅ History module loaded');
} catch (e) {
  console.error('❌ Failed to load history module:', e);
}

try {
  const { reportModule } = await import('./presentation/modules/report');
  app.use(reportModule);
  console.log('✅ Report module loaded');
} catch (e) {
  console.error('❌ Failed to load report module:', e);
}

try {
  const { userModule } = await import('./presentation/modules/user');
  app.use(userModule);
  console.log('✅ User module loaded');
} catch (e) {
  console.error('❌ Failed to load user module:', e);
}

export default app;
