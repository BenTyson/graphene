import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import biocharRoutes from './routes/biochar.js';
import grapheneRoutes from './routes/graphene.js';
import betRoutes from './routes/bet.js';
import conductivityRoutes from './routes/conductivity.js';
import ramanRoutes from './routes/raman.js';
import temRoutes from './routes/tem.js';
import updateReportRoutes from './routes/updateReports.js';
import semReportRoutes from './routes/semReports.js';
import compoundBatchRoutes from './routes/compoundBatch.js';
import shipmentRoutes from './routes/shipments.js';
import micronizationRoutes from './routes/micronization.js';
import dashboardRoutes from './routes/dashboard.js';
import analysisRoutes from './routes/analysis.js';
import aiInsightsRoutes from './routes/ai-insights.js';
import newsRoutes from './routes/news.js';
import knowledgeBaseRoutes from './routes/knowledge-base.js';
import authRoutes from './routes/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Comprehensive Railway debugging
console.log('=== RAILWAY DEBUG INFO ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT from env:', process.env.PORT);
console.log('PORT type:', typeof process.env.PORT);
console.log('Using PORT:', PORT);
console.log('RAILWAY_ENVIRONMENT:', process.env.RAILWAY_ENVIRONMENT);
console.log('RAILWAY_SERVICE_NAME:', process.env.RAILWAY_SERVICE_NAME);
console.log('RAILWAY_PROJECT_NAME:', process.env.RAILWAY_PROJECT_NAME);
console.log('PWD:', process.env.PWD);
console.log('Process arguments:', process.argv);
console.log('========================');

// Middleware - Configure Helmet CSP for CDN resources
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://cdn.jsdelivr.net",
        "https://unpkg.com"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://cdn.jsdelivr.net",
        "https://unpkg.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "http:"
      ],
      connectSrc: [
        "'self'",
        "https:"
      ]
    }
  }
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make prisma available in routes
app.locals.prisma = prisma;

// Health check - placed early for Railway compatibility
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    port: PORT,
    nodeEnv: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// Serve static files - use dist for production build, client for development
const staticPath = process.env.NODE_ENV === 'production' 
  ? path.join(process.cwd(), 'dist')
  : path.join(process.cwd(), 'client');
console.log('Serving static files from:', staticPath);
app.use(express.static(staticPath));

// In production, also explicitly serve assets directory
if (process.env.NODE_ENV === 'production') {
  app.use('/assets', express.static(path.join(process.cwd(), 'dist', 'assets')));
  console.log('Serving production assets from:', path.join(process.cwd(), 'dist', 'assets'));
}

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Serve cached news images with CORS headers
app.use('/news-images', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
}, express.static(path.join(process.cwd(), 'public', 'news-images')));

// Routes
app.use('/api/biochar', biocharRoutes);
app.use('/api/graphene', grapheneRoutes);
app.use('/api/bet', betRoutes);
app.use('/api/conductivity', conductivityRoutes);
app.use('/api/raman', ramanRoutes);
app.use('/api/tem', temRoutes);
app.use('/api/update-reports', updateReportRoutes);
app.use('/api/sem-reports', semReportRoutes);
app.use('/api/compound-batches', compoundBatchRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/micronization', micronizationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/ai-insights', aiInsightsRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/knowledge-base', knowledgeBaseRoutes);
app.use('/api/auth', authRoutes);

// Handle /src/* requests in production (these don't exist, should 404)
app.get('/src/*', (req, res) => {
  res.status(404).end();
});

// Catch-all route - serve index.html for client-side routing
// This MUST come after all other routes and static file serving
app.get('*', (req, res) => {
  const indexPath = process.env.NODE_ENV === 'production'
    ? path.join(process.cwd(), 'dist', 'index.html')
    : path.join(process.cwd(), 'client', 'index.html');
  res.sendFile(indexPath);
});

// Error handling
app.use(errorHandler);

// Start server - Railway works best with 0.0.0.0 or no explicit host
const HOST = '0.0.0.0';  // IPv4 all interfaces (Railway compatible)
const server = app.listen(PORT, HOST, () => {
  console.log('=== SERVER STARTED ===');
  console.log(`Host: ${HOST}`);
  console.log(`Port: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Server URL: http://${HOST}:${PORT}`);
  console.log(`Process PID: ${process.pid}`);
  console.log('======================');
});

// Additional server event logging
server.on('error', (err) => {
  console.error('=== SERVER ERROR ===');
  console.error('Error:', err);
  console.error('Port:', PORT);
  console.error('Host:', HOST);
  console.error('===================');
});

server.on('listening', () => {
  const address = server.address();
  console.log('=== SERVER LISTENING ===');
  console.log('Address info:', address);
  console.log('========================');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    prisma.$disconnect();
    process.exit(0);
  });
});