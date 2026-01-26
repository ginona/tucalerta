import type { NextFunction, Request, Response } from 'express';

interface AppError extends Error {
  code?: string;
  status?: number;
  stack?: string;
}

/**
 * Mapeo de códigos de error a status HTTP
 */
const ERROR_STATUS_MAP: Record<string, number> = {
  NOT_FOUND: 404,
  ALREADY_VOTED: 400,
  SELF_VOTE: 400,
  RATE_LIMIT: 429,
  VALIDATION_ERROR: 400,
  INVALID_LOCALITY: 400,
  MISSING_DEVICE_ID: 400,
  INVALID_DEVICE_ID: 400,
};

/**
 * Middleware global de manejo de errores
 */
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const isDevelopment = process.env.NODE_ENV !== 'production';

  console.error('[Error]', err.message, err.code || '');
  if (isDevelopment && err.stack) {
    console.error(err.stack);
  }

  // Errores de Prisma - Unique constraint violation
  if ((err as any).code === 'P2002') {
    res.status(400).json({
      error: 'Conflicto de datos',
      code: 'DUPLICATE_ENTRY',
      message: 'Ya existe un registro con estos datos',
      ...(isDevelopment && { stack: err.stack }),
    });
    return;
  }

  // Errores de Prisma - Record not found
  if ((err as any).code === 'P2025') {
    res.status(404).json({
      error: 'No encontrado',
      code: 'NOT_FOUND',
      message: 'El recurso solicitado no existe',
      ...(isDevelopment && { stack: err.stack }),
    });
    return;
  }

  // Errores de rate limit por mensaje
  if (err.message.toLowerCase().includes('rate limit') || err.message.includes('esperar')) {
    res.status(429).json({
      error: 'Rate limit excedido',
      code: 'RATE_LIMIT',
      message: err.message,
      ...(isDevelopment && { stack: err.stack }),
    });
    return;
  }

  // Errores de "ya votaste"
  if (err.message.toLowerCase().includes('ya votaste')) {
    res.status(400).json({
      error: 'Ya votaste',
      code: 'ALREADY_VOTED',
      message: err.message,
      ...(isDevelopment && { stack: err.stack }),
    });
    return;
  }

  // Errores de la aplicación con código conocido
  if (err.code) {
    const statusCode = ERROR_STATUS_MAP[err.code];
    if (statusCode) {
      res.status(statusCode).json({
      error: err.message,
      code: err.code,
      message: err.message,
      ...(isDevelopment && { stack: err.stack }),
    });
    return;
    }
  }

  // Error genérico 500
  const statusCode = err.status || 500;
  const message = isDevelopment ? err.message : 'Error interno del servidor';

  res.status(statusCode).json({
    error: 'Error interno',
    code: 'INTERNAL_ERROR',
    message,
    ...(isDevelopment && { stack: err.stack }),
  });
}
