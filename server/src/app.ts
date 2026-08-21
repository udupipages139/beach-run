import express from 'express';
import cors from 'cors';
import apiRouter from './routes/api.js';

const app = express();

// Enable CORS for client application
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Capture raw body for Razorpay Webhook signature verification
app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  }
}));

app.use(express.urlencoded({ extended: true }));

// Healthcheck endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', event: 'Udupipages Beach Run 2026 API' });
});

// API Routes
app.use('/api', apiRouter);

export default app;
