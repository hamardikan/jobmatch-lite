/**
 * JobMatch Lite API
 *
 * Backend API for resume-to-job description matching service.
 */

import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { healthModule } from '@/presentation/modules/health';
import { analysisModule } from '@/presentation/modules/analysis';
import { reportModule } from '@/presentation/modules/report';
import { historyModule } from '@/presentation/modules/history';
import { authMiddleware } from '@/presentation/middleware/auth';
import { errorHandler } from '@/presentation/middleware/error-handler';

const app = new Elysia()
  .use(
    cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    })
  )
  .use(authMiddleware)
  .use(errorHandler)
  .use(healthModule)
  .use(analysisModule)
  .use(reportModule)
  .use(historyModule)
  .get('/', () => ({
    message: 'JobMatch Lite API',
    version: '1.0.0',
    docs: '/swagger',
  }));

// Export for Vercel (Bun auto-serves when running with `bun run`)
export default app;

// Log startup message
console.log(`🚀 JobMatch Lite API ready on port ${process.env.PORT || 3001}`);
