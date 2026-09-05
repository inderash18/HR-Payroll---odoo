import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { requestIdMiddleware } from './middleware/request-id.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { apiRateLimiter } from './middleware/rate-limit.middleware.js';
import apiRouter from './routes/index.js';

export const app = express();

// Security headers & middleware
app.use(helmet({ contentSecurityPolicy: false }));

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Request-Id',
      'X-Organization-Id',
      'Idempotency-Key',
    ],
  })
);

app.use(cookieParser(env.COOKIE_SECRET));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(requestIdMiddleware);
app.use(apiRateLimiter);

// Mount API routes
app.use(env.API_PREFIX, apiRouter);

// Root & 404 handler
app.get('/', (req, res) => {
  res.json({
    app: env.APP_NAME,
    status: 'running',
    version: '1.0.0',
    docs: `${env.API_PREFIX}/health/liveness`,
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.url}`,
    errorCode: 'NOT_FOUND',
  });
});

// Global error handler
app.use(errorHandler);
