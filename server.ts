import http from 'http';
import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { initSocketIO } from './server/socket.js';
import { authenticate } from './server/auth.js';

import authRouter from './server/routes/auth.js';
import moviesRouter from './server/routes/movies.js';
import theatresRouter from './server/routes/theatres.js';
import showsRouter from './server/routes/shows.js';
import bookingsRouter from './server/routes/bookings.js';
import paymentsRouter from './server/routes/payments.js';
import adminRouter from './server/routes/admin.js';
import notificationsRouter from './server/routes/notifications.js';
import promotionsRouter from './server/routes/promotions.js';

const app = express();
const server = http.createServer(app);
const PORT = 3000;

// Enable trust proxy for Cloud Run and reverse proxy environments
app.set('trust proxy', 1);

// Initialize Socket.IO with real-time seat reservation sync
initSocketIO(server);

// Security Headers (relaxed CSP for iframe and inline scripts in Vite dev)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global Authentication parser
app.use(authenticate as any);

// General API Rate Limiting (configured for reverse proxy)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  message: { success: false, error: 'Too many requests. Please try again later.' },
});
app.use('/api', apiLimiter);

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/movies', moviesRouter);
app.use('/api/theatres', theatresRouter);
app.use('/api/shows', showsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/promotions', promotionsRouter);

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'IMovies API Engine',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Central Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[IMovies Server Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// Frontend Integration: Vite in development or static dist in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🎬 [IMovies] Full-Stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[IMovies] Failed to start server:', err);
  process.exit(1);
});
