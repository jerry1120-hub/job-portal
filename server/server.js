import './config/instrument.js';
import express from 'express';
import cors from 'cors';
import 'dotenv/config.js';
import * as Sentry from '@sentry/node';
import { clerkMiddleware } from '@clerk/express';

import connectDB from './config/db.js';
import connectCloudinary from './config/cloudinary.js';
import { clerkWebhooks } from './controllers/webhooks.js';
import companyRoutes from './routes/companyRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import userRoutes from './routes/userRoutes.js';

// ==========================
// ✅ Initialize Express App
// ==========================
const app = express();

// ==========================
// ✅ Initialize Sentry (v8+ style)
// ==========================
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  integrations: [
    // Optional: automatic tracing of HTTP requests
    Sentry.prismaIntegration?.(),
  ],
});

console.log('✅ Sentry profiling and tracing started successfully');

// ==========================
// ✅ Global Middlewares
// ==========================
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// ==========================
// ✅ Routes
// ==========================
app.get('/', (req, res) => res.send('🚀 API is working fine!'));

app.get('/debug-sentry', (req, res) => {
  throw new Error('My first Sentry error!');
});

app.post('/webhooks', clerkWebhooks);

// API routes
app.use('/api/company', companyRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/user', userRoutes);


// ==========================
// ✅ Error Handling Middleware
// ==========================
app.use((err, req, res, next) => {
  console.error('❌ Unhandled Error:', err.message);
  Sentry.captureException(err); // ✅ send error to Sentry
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// ==========================
// ✅ Start Server
// ==========================
const startServer = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB connected');

    await connectCloudinary();
    console.log('✅ Cloudinary connected');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`✅ Server running on http://localhost:${PORT}`)
    );
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
