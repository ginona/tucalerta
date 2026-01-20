import type { AlertType } from '@tucalerta/types';
import type { NextFunction, Request, Response } from 'express';
import * as alertService from '../services/alertService';

/**
 * GET /alerts
 * Obtiene lista de alertas con filtros opcionales
 */
export async function getAllAlerts(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { type, localityId, includeHidden } = req.query;

    const filters = {
      type: type as AlertType | undefined,
      localityId: localityId as string | undefined,
      includeHidden: includeHidden === 'true',
    };

    const alerts = await alertService.getAlerts(filters);
    res.status(200).json(alerts);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /alerts/:id
 * Obtiene una alerta por su ID
 */
export async function getAlertById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string;
    const alert = await alertService.getAlertById(id);
    res.status(200).json(alert);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /alerts
 * Crea una nueva alerta
 */
export async function createAlert(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const deviceId = (req as any).deviceId as string;
    const { type, localityId, coordinates, description, severity, imageUrl } = req.body;

    const alert = await alertService.createAlert(
      {
        type,
        localityId,
        coordinates,
        description,
        severity,
        deviceId,
        imageUrl,
      },
      deviceId,
    );

    res.status(201).json(alert);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /alerts/:id/vote
 * Vota en una alerta (confirmar o rechazar)
 */
export async function voteAlert(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const alertId = req.params.id as string;
    const deviceId = (req as any).deviceId as string;
    const { voteType } = req.body;

    const alert = await alertService.voteAlert(alertId, deviceId, voteType);
    res.status(200).json(alert);
  } catch (error) {
    next(error);
  }
}
