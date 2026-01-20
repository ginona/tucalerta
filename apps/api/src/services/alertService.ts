import type { Alert, AlertType, CreateAlertDTO } from '@tucalerta/types';
import { prisma } from '../lib/prisma';

const RATE_LIMIT_MS = 15 * 60 * 1000; // 15 minutos entre reportes
const ALERT_EXPIRY_HOURS = 24; // Las alertas expiran en 24 horas

interface AlertFilters {
  type?: AlertType;
  localityId?: string;
  includeHidden?: boolean;
}

/**
 * Transforma un alert de Prisma al formato de la API
 */
function transformAlert(dbAlert: any): Alert {
  return {
    id: dbAlert.id,
    type: dbAlert.type as AlertType,
    locality: {
      id: dbAlert.locality.id,
      name: dbAlert.locality.name,
      coordinates: [dbAlert.locality.latitude, dbAlert.locality.longitude],
      province: 'tucuman',
    },
    coordinates: [dbAlert.latitude, dbAlert.longitude],
    description: dbAlert.description,
    severity: dbAlert.severity as 1 | 2 | 3,
    status: dbAlert.status,
    confirmations: dbAlert.confirmations,
    rejections: dbAlert.rejections,
    validationScore: dbAlert.validationScore,
    autoHidden: dbAlert.autoHidden,
    isVerified: dbAlert.isVerified,
    deviceFingerprints: dbAlert.deviceFingerprints,
    reportedBy: dbAlert.reportedBy,
    createdAt: dbAlert.createdAt,
    updatedAt: dbAlert.updatedAt,
    imageUrl: dbAlert.imageUrl,
  };
}

/**
 * Obtiene lista de alertas con filtros opcionales
 */
export async function getAlerts(filters: AlertFilters = {}): Promise<Alert[]> {
  // Calcular fecha de expiración (24 horas atrás)
  const expiryDate = new Date(Date.now() - ALERT_EXPIRY_HOURS * 60 * 60 * 1000);

  const where: any = {
    // Solo alertas de las últimas 24 horas
    createdAt: {
      gte: expiryDate,
    },
  };

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.localityId) {
    where.localityId = filters.localityId;
  }

  if (!filters.includeHidden) {
    where.autoHidden = false;
  }

  const alerts = await prisma.alert.findMany({
    where,
    include: {
      locality: true,
    },
    orderBy: [
      { isVerified: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  return alerts.map(transformAlert);
}

/**
 * Obtiene una alerta por ID
 */
export async function getAlertById(alertId: string): Promise<Alert> {
  const alert = await prisma.alert.findUnique({
    where: { id: alertId },
    include: {
      locality: true,
    },
  });

  if (!alert) {
    const error = new Error('Alerta no encontrada');
    (error as any).code = 'NOT_FOUND';
    throw error;
  }

  return transformAlert(alert);
}

/**
 * Verifica si un dispositivo puede reportar (rate limit de 1 hora)
 */
export async function canDeviceReport(deviceId: string): Promise<boolean> {
  const deviceValidation = await prisma.deviceValidation.findUnique({
    where: { deviceId },
  });

  if (!deviceValidation || !deviceValidation.lastReportAt) {
    return true;
  }

  const timeSinceLastReport = Date.now() - deviceValidation.lastReportAt.getTime();
  return timeSinceLastReport >= RATE_LIMIT_MS;
}

/**
 * Crea una nueva alerta
 */
export async function createAlert(data: CreateAlertDTO, deviceId: string): Promise<Alert> {
  // Verificar rate limit
  const canReport = await canDeviceReport(deviceId);
  if (!canReport) {
    const error = new Error('Debes esperar 15 minutos entre reportes');
    (error as any).code = 'RATE_LIMIT';
    throw error;
  }

  // Verificar que la localidad existe
  const locality = await prisma.locality.findUnique({
    where: { id: data.localityId },
  });

  if (!locality) {
    const error = new Error('Localidad no encontrada');
    (error as any).code = 'INVALID_LOCALITY';
    throw error;
  }

  // Crear alerta y actualizar device validation en una transacción
  const result = await prisma.$transaction(async (tx) => {
    // Crear la alerta
    const alert = await tx.alert.create({
      data: {
        type: data.type,
        localityId: data.localityId,
        latitude: data.coordinates[0],
        longitude: data.coordinates[1],
        description: data.description,
        severity: data.severity,
        reportedBy: deviceId,
        imageUrl: data.imageUrl,
        confirmations: 0,
        rejections: 0,
        validationScore: 0,
        autoHidden: false,
        isVerified: false,
        deviceFingerprints: [],
      },
      include: {
        locality: true,
      },
    });

    // Actualizar o crear device validation
    await tx.deviceValidation.upsert({
      where: { deviceId },
      create: {
        deviceId,
        lastReportAt: new Date(),
      },
      update: {
        lastReportAt: new Date(),
      },
    });

    return alert;
  });

  return transformAlert(result);
}

/**
 * Vota en una alerta
 */
export async function voteAlert(
  alertId: string,
  deviceId: string,
  voteType: 'confirm' | 'reject',
): Promise<Alert> {
  // Obtener alerta actual
  const alert = await prisma.alert.findUnique({
    where: { id: alertId },
    include: { locality: true },
  });

  if (!alert) {
    const error = new Error('Alerta no encontrada');
    (error as any).code = 'NOT_FOUND';
    throw error;
  }

  // Verificar si ya votó
  if (alert.deviceFingerprints.includes(deviceId)) {
    const error = new Error('Ya votaste en esta alerta');
    (error as any).code = 'ALREADY_VOTED';
    throw error;
  }

  // No permitir votar en tu propia alerta
  if (alert.reportedBy === deviceId) {
    const error = new Error('No puedes votar en tu propia alerta');
    (error as any).code = 'SELF_VOTE';
    throw error;
  }

  // Calcular nuevos valores
  const newConfirmations = alert.confirmations + (voteType === 'confirm' ? 1 : 0);
  const newRejections = alert.rejections + (voteType === 'reject' ? 1 : 0);
  const newValidationScore = newConfirmations - newRejections;
  const isVerified = newValidationScore >= 3;
  const autoHidden = newValidationScore <= -3;

  // Actualizar en transacción
  const result = await prisma.$transaction(async (tx) => {
    // Actualizar alerta
    const updatedAlert = await tx.alert.update({
      where: { id: alertId },
      data: {
        confirmations: newConfirmations,
        rejections: newRejections,
        validationScore: newValidationScore,
        isVerified,
        autoHidden,
        deviceFingerprints: {
          push: deviceId,
        },
      },
      include: {
        locality: true,
      },
    });

    // Registrar voto
    await tx.vote.create({
      data: {
        alertId,
        deviceId,
        voteType,
      },
    });

    // Actualizar device validation
    await tx.deviceValidation.upsert({
      where: { deviceId },
      create: {
        deviceId,
        lastVoteAt: new Date(),
      },
      update: {
        lastVoteAt: new Date(),
      },
    });

    return updatedAlert;
  });

  return transformAlert(result);
}
