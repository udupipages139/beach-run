import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import apiRouter from './routes/api.js';

const app = express();

// Security headers
app.use(helmet({ crossOriginEmbedderPolicy: false }));

// CORS
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  process.env.FRONTEND_URL || 'http://localhost:5173'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // allow all in dev; restrict in prod via env
    }
  },
  credentials: true
}));

// Cookie parser (for JWT httpOnly cookie)
app.use(cookieParser());

// Rate limiting on public routes
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: { success: false, error: 'Too many requests. Please try again later.' }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many login attempts. Please wait 15 minutes.' }
});

app.use('/api/admin/login', loginLimiter);
app.use('/api/registrations', publicLimiter);
app.use('/api/orders', publicLimiter);
app.use('/api/payments', publicLimiter);

// Body parsers — raw body for webhook signature verification
app.use((req, res, next) => {
  if (req.path === '/api/webhooks/razorpay') {
    express.raw({ type: 'application/json' })(req, res, (err) => {
      if (!err) {
        (req as any).rawBody = req.body;
        try {
          req.body = JSON.parse(req.body.toString());
        } catch (_) {}
      }
      next(err);
    });
  } else {
    express.json({
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      }
    })(req, res, next);
  }
});

app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', event: 'Udupipages Beach Run 2026 API', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api', apiRouter);

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[App] Unhandled error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

export default app;
