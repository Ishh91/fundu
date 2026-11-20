import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env FIRST before importing any routes or services
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { parseAuth } from './middleware/auth.js';
import apiRoutes from './routes/index.js';
import { recordServerError } from './routes/errorRoutes.js';
import { mobileCache } from './utils/mobileApi.js';
import { countRequest, takeTopRoutes } from './utils/requestStats.js';
import { getRouteCacheSize } from './routes/dbRoutes.js';
import { getQuoteAuditCount } from './services/quoteService.js';

const app = express();
const PORT = Number(process.env.PORT || 4000);

// Render and similar hosts sit behind one proxy; trust it so req.ip is the real client address.
app.set('trust proxy', 1);

// Bulletproof Universal CORS Middleware (Always set headers first)
app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;
  
  // Set CORS headers for all origins including production domain
  if (requestOrigin) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  // The allowed origin changes per request, so caches must keep one copy per origin
  // (otherwise www.thefundu.com can be served a copy meant for another origin).
  res.vary('Origin');

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  const requestedHeaders = req.headers['access-control-request-headers'];
  if (requestedHeaders) {
    res.setHeader('Access-Control-Allow-Headers', requestedHeaders);
  } else {
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Range, x-custom-header, apikey, Cache-Control, Pragma, Expires, If-Modified-Since, If-None-Match');
  }
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range, X-Total-Count');

  // Handle browser OPTIONS preflight requests cleanly
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Counts requests per route pattern for the [memory] log line below. The pattern is read when the reply is sent, once the router has matched.
app.use((req, res, next) => {
  res.on('finish', () => {
    const table = req.params?.table ? ` [${req.params.table}]` : '';
    countRequest(`${req.method} ${req.baseUrl || ''}${req.route?.path ?? ''}${table}`);
  });
  next();
});

app.use(parseAuth);
app.use('/api', apiRoutes);

app.get('/favicon.ico', (_req, res) => {
  const icoPath = path.resolve(__dirname, '..', 'public', 'favicon.ico');
  res.sendFile(icoPath, (err) => {
    if (err) res.status(204).end();
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'fundu-api', time: new Date().toISOString() });
});

// Global Error Handler with guaranteed CORS headers on failure
app.use((err, req, res, _next) => {
  console.error('Unhandled server error:', err);
  const requestOrigin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', requestOrigin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  const status = err.status || err.statusCode || 500;
  if (status >= 500) {
    try {
      recordServerError(err, req);
    } catch {}
  }
  // express.json() rejects bodies over its limit before any route runs.
  const message = err.type === 'entity.too.large'
    ? 'This is too large to save (the limit is 10 MB). Use fewer or smaller photos, and a YouTube link instead of an uploaded video.'
    : err.message || 'Internal Server Error';
  res.status(status).json({ error: message });
});

async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });

  // One line every 2 minutes (MEMORY_LOG_MS to change), so the host's logs show whether memory climbs before a crash ("heap out of memory"). unref: it never keeps the process alive.
  setInterval(() => {
    const { heapUsed, rss, external, arrayBuffers } = process.memoryUsage();
    const { top, total } = takeTopRoutes(5);
    console.log(
      `[memory] heap ${Math.round(heapUsed / 1048576)} MB, rss ${Math.round(rss / 1048576)} MB, external ${Math.round(external / 1048576)} MB, buffers ${Math.round(arrayBuffers / 1048576)} MB`
      + ` | mobile cache ${mobileCache.size}, db route cache ${getRouteCacheSize()}, quote audits ${getQuoteAuditCount()}`
      + ` | ${total} requests since the last line: ${top.join(', ') || 'none'}`,
    );
  }, Number(process.env.MEMORY_LOG_MS) || 2 * 60 * 1000).unref();
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
