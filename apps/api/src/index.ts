import cors from 'cors';
import dotenv from 'dotenv';
import express, { type Request, type Response } from 'express';
import { errorHandler } from './middleware/errorHandler';
import { extractDeviceId } from './middleware/validation';
import alertsRouter from './routes/alerts';
import localitiesRouter from './routes/localities';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// =============================================================================
// Middlewares globales
// =============================================================================

// CORS configurado para el frontend
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-Device-Id'],
  }),
);

// Parsear JSON
app.use(express.json());

// =============================================================================
// Rutas públicas (sin device ID)
// =============================================================================

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// =============================================================================
// Middleware de Device ID (para todas las rutas protegidas)
// =============================================================================

app.use('/alerts', extractDeviceId);
app.use('/localities', extractDeviceId);

// =============================================================================
// Rutas de la API
// =============================================================================

app.use('/alerts', alertsRouter);
app.use('/localities', localitiesRouter);

// =============================================================================
// 404 Handler
// =============================================================================

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    code: 'NOT_FOUND',
    message: 'El recurso solicitado no existe',
  });
});

// =============================================================================
// Error Handler Global
// =============================================================================

app.use(errorHandler);

// =============================================================================
// Iniciar servidor
// =============================================================================

app.listen(PORT, () => {
  console.log(`🚀 TucAlerta API running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 CORS enabled for: ${FRONTEND_URL}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});
