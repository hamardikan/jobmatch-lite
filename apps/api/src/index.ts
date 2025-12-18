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
import { errorHandler } from '@/presentation/middleware/error-handler';

const app = new Elysia()
  .use(
    cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type'],
      credentials: true,
    })
  )
  .use(errorHandler)
  .use(healthModule)
  .use(analysisModule)
  .use(reportModule)
  .get('/', () => ({
    message: 'JobMatch Lite API',
    version: '1.0.0',
    docs: '/swagger',
  }))
  .listen(process.env.PORT || 3001);

console.log(
  `🚀 JobMatch Lite API is running at ${app.server?.hostname}:${app.server?.port}`
);

// Export for Vercel
export default app;
