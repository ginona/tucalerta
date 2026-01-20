import type { NextFunction, Request, Response } from 'express';

// Bounds de Tucumán para validar coordenadas
const TUCUMAN_BOUNDS = {
  minLat: -27.6,
  maxLat: -26.0,
  minLng: -66.2,
  maxLng: -64.4,
};

// Tipos válidos de alerta
const VALID_ALERT_TYPES = ['flood', 'power_outage'] as const;

// Severidades válidas
const VALID_SEVERITIES = [1, 2, 3] as const;

// Tipos válidos de voto
const VALID_VOTE_TYPES = ['confirm', 'reject'] as const;

/**
 * Sanitiza texto removiendo HTML básico
 */
function sanitizeText(text: string): string {
  return text
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, ''); // Remove remaining < >
}

/**
 * Extrae y valida el device ID del header
 */
export function extractDeviceId(req: Request, res: Response, next: NextFunction): void {
  const deviceId = req.headers['x-device-id'];

  if (!deviceId || typeof deviceId !== 'string') {
    res.status(400).json({
      error: 'Device ID requerido',
      code: 'MISSING_DEVICE_ID',
      message: 'El header X-Device-Id es requerido',
    });
    return;
  }

  // Validar formato UUID básico
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(deviceId)) {
    res.status(400).json({
      error: 'Device ID inválido',
      code: 'INVALID_DEVICE_ID',
      message: 'El Device ID debe ser un UUID válido',
    });
    return;
  }

  // Agregar deviceId al request
  (req as any).deviceId = deviceId;
  next();
}

/**
 * Valida el body de crear alerta
 */
export function validateCreateAlert(req: Request, res: Response, next: NextFunction): void {
  const { type, localityId, coordinates, description, severity } = req.body;

  const errors: string[] = [];

  // Validar tipo
  if (!type || !VALID_ALERT_TYPES.includes(type)) {
    errors.push(`Tipo de alerta inválido. Debe ser: ${VALID_ALERT_TYPES.join(', ')}`);
  }

  // Validar localityId
  if (!localityId || typeof localityId !== 'string') {
    errors.push('LocalityId es requerido');
  }

  // Validar coordenadas
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
    errors.push('Coordenadas inválidas. Debe ser [lat, lng]');
  } else {
    const [lat, lng] = coordinates;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      errors.push('Las coordenadas deben ser números');
    } else if (
      lat < TUCUMAN_BOUNDS.minLat ||
      lat > TUCUMAN_BOUNDS.maxLat ||
      lng < TUCUMAN_BOUNDS.minLng ||
      lng > TUCUMAN_BOUNDS.maxLng
    ) {
      errors.push('Las coordenadas deben estar dentro de Tucumán');
    }
  }

  // Validar descripción
  if (!description || typeof description !== 'string') {
    errors.push('Descripción es requerida');
  } else if (description.trim().length < 10) {
    errors.push('La descripción debe tener al menos 10 caracteres');
  } else if (description.length > 500) {
    errors.push('La descripción no puede exceder 500 caracteres');
  }

  // Validar severidad
  if (severity === undefined || !VALID_SEVERITIES.includes(severity)) {
    errors.push(`Severidad inválida. Debe ser: ${VALID_SEVERITIES.join(', ')}`);
  }

  if (errors.length > 0) {
    res.status(400).json({
      error: 'Validación fallida',
      code: 'VALIDATION_ERROR',
      message: errors.join('. '),
      details: errors,
    });
    return;
  }

  // Sanitizar descripción
  req.body.description = sanitizeText(description);

  next();
}

/**
 * Valida el body de votar
 */
export function validateVote(req: Request, res: Response, next: NextFunction): void {
  const { voteType } = req.body;
  const { id: alertId } = req.params;

  const errors: string[] = [];

  // Validar alertId
  if (!alertId || typeof alertId !== 'string') {
    errors.push('AlertId es requerido');
  }

  // Validar voteType
  if (!voteType || !VALID_VOTE_TYPES.includes(voteType)) {
    errors.push(`Tipo de voto inválido. Debe ser: ${VALID_VOTE_TYPES.join(', ')}`);
  }

  if (errors.length > 0) {
    res.status(400).json({
      error: 'Validación fallida',
      code: 'VALIDATION_ERROR',
      message: errors.join('. '),
      details: errors,
    });
    return;
  }

  next();
}
