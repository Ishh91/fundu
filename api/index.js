import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

import { parseAuth } from '../server/middleware/auth.js';
import apiRoutes from '../server/routes/index.js';

const app = express();

// Universal CORS Middleware
app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;
  if (requestOrigin) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Range, x-custom-header, apikey');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range, X-Total-Count');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cached Serverless MongoDB Connection
let isConnected = false;
async function connectToDatabase() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://trustiqueassist0003_db_user:r1BrCdYiCcPgBxK6@cluster0.w56fxzj.mongodb.net/?appName=Cluster0';
  const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'fundu';

  await mongoose.connect(MONGODB_URI, {
    dbName: MONGODB_DB_NAME,
    tls: true,
    tlsAllowInvalidCertificates: true,
    serverSelectionTimeoutMS: 8000,
    autoIndex: false,
  });
  isConnected = true;
}

// Ensure DB is connected for every incoming request
app.use(async (_req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error('Serverless DB connection error:', err);
    res.status(500).json({ error: 'Database connection failed', details: err.message });
  }
});

app.use(parseAuth);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'fundu-vercel-serverless', time: new Date().toISOString() });
});
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'fundu-vercel-serverless', time: new Date().toISOString() });
});

// Mount API routes under /api and also root (in case rewrites strip /api)
app.use('/api', apiRoutes);
app.use('/', apiRoutes);

// Global Error Handler
app.use((err, req, res, _next) => {
  console.error('Unhandled server error:', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
  });
});

export default app;
