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

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make prisma available in routes
app.locals.prisma = prisma;

// Serve static files
app.use(express.static(path.join(process.cwd(), 'client')));

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Start server  
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    prisma.$disconnect();
    process.exit(0);
  });
});