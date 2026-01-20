/**
 * @tucalerta/types
 * Tipos compartidos para el sistema de alertas ciudadanas
 *
 * REGLAS DE NEGOCIO:
 * - Un device puede reportar máximo 1 alerta por hora
 * - Un device puede votar en una alerta solo 1 vez
 * - Si validationScore < -3 → autoHidden = true
 * - Si validationScore >= 3 → isVerified = true
 */

// =============================================================================
// Alert Types & Enums
// =============================================================================

export type AlertType = 'flood' | 'power_outage';

export type AlertStatus = 'active' | 'resolved' | 'investigating';

export type AlertSeverity = 1 | 2 | 3;

export type VoteType = 'confirm' | 'reject';

// =============================================================================
// Locality
// =============================================================================

export interface Locality {
  id: string;
  name: string;
  /** Coordenadas [latitud, longitud] */
  coordinates: [number, number];
  province: 'tucuman';
}

// =============================================================================
// Alert
// =============================================================================

export interface Alert {
  id: string;
  type: AlertType;
  locality: Locality;
  /** Coordenadas exactas del incidente [latitud, longitud] */
  coordinates: [number, number];
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  /** Cantidad de confirmaciones recibidas */
  confirmations: number;
  /** Cantidad de rechazos recibidos */
  rejections: number;
  /**
   * Puntaje de validación = confirmations - rejections
   * Determina la visibilidad y verificación de la alerta
   */
  validationScore: number;
  /**
   * Se oculta automáticamente si validationScore < -3
   * Las alertas ocultas no aparecen en el mapa público
   */
  autoHidden: boolean;
  /**
   * true si validationScore >= 3
   * Las alertas verificadas tienen mayor prioridad visual
   */
  isVerified: boolean;
  /**
   * Lista de fingerprints de dispositivos que ya votaron
   * Evita spam y votos duplicados del mismo dispositivo
   */
  deviceFingerprints: string[];
  /** deviceId del usuario que reportó la alerta */
  reportedBy: string;
  createdAt: Date;
  updatedAt: Date;
  /** URL de imagen opcional adjunta a la alerta */
  imageUrl?: string;
}

// =============================================================================
// DTOs
// =============================================================================

export interface CreateAlertDTO {
  type: AlertType;
  localityId: string;
  /** Coordenadas exactas del incidente [latitud, longitud] */
  coordinates: [number, number];
  description: string;
  severity: AlertSeverity;
  /**
   * Fingerprint único del dispositivo
   * Se usa para aplicar rate limiting: máximo 1 alerta por hora por device
   */
  deviceId: string;
  imageUrl?: string;
}

export interface VoteAlertDTO {
  alertId: string;
  /**
   * Fingerprint único del dispositivo
   * Un device solo puede votar 1 vez por alerta
   */
  deviceId: string;
  voteType: VoteType;
}

// =============================================================================
// Device Validation
// =============================================================================

export interface DeviceValidation {
  deviceId: string;
  /**
   * Última vez que este device reportó una alerta
   * Se usa para aplicar rate limiting de 1 hora entre reportes
   */
  lastReportAt?: Date;
  /**
   * Última vez que este device votó en alguna alerta
   */
  lastVoteAt?: Date;
}

// =============================================================================
// Constants
// =============================================================================

/** Umbral negativo para ocultar alertas automáticamente */
export const AUTO_HIDE_THRESHOLD = -3;

/** Umbral positivo para marcar alertas como verificadas */
export const VERIFIED_THRESHOLD = 3;

/** Tiempo mínimo entre reportes del mismo device (en ms) */
export const REPORT_COOLDOWN_MS = 60 * 60 * 1000; // 1 hora
