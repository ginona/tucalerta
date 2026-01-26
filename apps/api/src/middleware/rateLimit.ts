import type { NextFunction, Request, Response } from 'express';
import * as alertService from '../services/alertService';

// === RATE LIMIT GLOBAL (anti-DDoS) ===
const GLOBAL_LIMIT = 5; // máx alertas por ventana
const WINDOW_MS = 60 * 1000; // 1 minuto
const alertTimestamps: number[] = [];

function isGlobalRateLimited(): boolean {
  const now = Date.now();
  // Limpiar timestamps viejos
  while (alertTimestamps.length > 0 && alertTimestamps[0] < now - WINDOW_MS) {
    alertTimestamps.shift();
  }
  return alertTimestamps.length >= GLOBAL_LIMIT;
}

function recordAlert(): void {
  alertTimestamps.push(Date.now());
}

/**
 * Middleware para rate limit GLOBAL (protección anti-flood)
 */
export function checkGlobalRateLimit(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (isGlobalRateLimited()) {
    res.status(429).json({
      error: 'Servidor ocupado',
      code: 'GLOBAL_RATE_LIMIT',
      message: 'Demasiadas alertas en este momento. Intentá en 1 minuto.',
    });
    return;
  }
  recordAlert();
  next();
}

/**
 * Middleware para verificar rate limit de reportes (1 por hora)
 */
export async function checkReportRateLimit(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const deviceId = (req as any).deviceId;

    if (!deviceId) {
      res.status(400).json({
        error: 'Device ID requerido',
        code: 'MISSING_DEVICE_ID',
        message: 'No se encontró el Device ID',
      });
      return;
    }

    const canReport = await alertService.canDeviceReport(deviceId);

    if (!canReport) {
      res.status(429).json({
        error: 'Rate limit excedido',
        code: 'RATE_LIMIT',
        message: 'Debes esperar 1 hora entre reportes',
      });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware para rate limit de votos
 * Por ahora es un placeholder, la validación principal está en el service
 */
export function checkVoteRateLimit(
  _req: Request,
  _res: Response,
  next: NextFunction,
): void {
  // La validación de "ya votó" se hace en el service
  // Este middleware puede usarse para rate limiting adicional si es necesario
  next();
}
