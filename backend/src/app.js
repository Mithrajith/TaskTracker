import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import studentTaskRoutes from './routes/studentTaskRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import auditLogRoutes from './routes/auditLogRoutes.js';

const app = express();

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow frontend to fetch proof images
  })
);

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl) or if origin is in allowedOrigins
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, true); // Allow during dev / preview
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint to inform users and prevent "Cannot GET /"
app.get(['/', '/api'], (req, res) => {
  const dbState = mongoose.connection.readyState;
  const statusMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({
    success: true,
    message: 'AI Engineer Student Task Tracker Backend API is active',
    database: {
      status: statusMap[dbState] || 'unknown',
      connected: dbState === 1,
      cluster: mongoose.connection.host || 'MongoDB Atlas',
      databaseName: mongoose.connection.name || 'test',
    },
    version: '1.0.0',
    endpoints: {
      health: '/api/v1/health',
      auth: '/api/v1/auth',
      students: '/api/v1/students',
      users: '/api/v1/users',
      tasks: '/api/v1/tasks',
      studentTasks: '/api/v1/student-tasks',
      submissions: '/api/v1/submissions',
      reviews: '/api/v1/reviews',
      files: '/api/v1/files/:fileId',
      analytics: '/api/v1/analytics/overview',
      auditLogs: '/api/v1/audit-logs',
    },
  });
});

// Rate limiter for API routes
app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'AI Engineer Task Tracker API',
  });
});

// API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/student-tasks', studentTaskRoutes);
app.use('/api/v1/submissions', submissionRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/files', fileRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/audit-logs', auditLogRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handler
app.use(errorHandler);

export default app;

