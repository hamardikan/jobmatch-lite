/**
 * Health Check Module
 */

import { Elysia, t } from 'elysia';
import type { HealthResponse } from '../../../types';

const healthResponseSchema = t.Object({
  status: t.Union([t.Literal('healthy'), t.Literal('degraded'), t.Literal('unhealthy')]),
  version: t.String(),
  timestamp: t.String(),
  services: t.Optional(
    t.Object({
      openRouter: t.Optional(t.Union([t.Literal('connected'), t.Literal('disconnected')])),
      puppeteer: t.Optional(t.Union([t.Literal('ready'), t.Literal('unavailable')])),
    })
  ),
  uptime: t.Optional(t.Number()),
});

const startTime = Date.now();

export const healthModule = new Elysia({ prefix: '/api' }).get(
  '/health',
  (): HealthResponse => ({
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      openRouter: process.env.OPENROUTER_API_KEY ? 'connected' : 'disconnected',
      puppeteer: 'ready',
    },
    uptime: Math.floor((Date.now() - startTime) / 1000),
  }),
  {
    response: healthResponseSchema,
    detail: {
      tags: ['System'],
      summary: 'Health check endpoint',
      description: 'Returns the current health status of the API service.',
    },
  }
);
