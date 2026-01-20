import type { NextFunction, Request, Response } from 'express';
import * as alertService from '../services/alertService';

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
