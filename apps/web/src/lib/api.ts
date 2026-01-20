import type { Alert, CreateAlertDTO, Locality } from '@tucalerta/types';
import { getDeviceId } from './fingerprint';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Errores específicos de la API
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class RateLimitError extends ApiError {
  constructor(message = 'Debes esperar antes de realizar otra acción') {
    super(429, 'RATE_LIMIT', message);
    this.name = 'RateLimitError';
  }
}

export class AlreadyVotedError extends ApiError {
  constructor(message = 'Ya votaste en esta alerta') {
    super(400, 'ALREADY_VOTED', message);
    this.name = 'AlreadyVotedError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Recurso no encontrado') {
    super(404, 'NOT_FOUND', message);
    this.name = 'NotFoundError';
  }
}

/**
 * Fetch helper que incluye deviceId y manejo de errores
 */
async function fetchWithDeviceId<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const deviceId = getDeviceId();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Id': deviceId,
      ...options.headers,
    },
  });

  // Intentar parsear el body como JSON
  let data: { message?: string; code?: string } | T;
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const errorData = data as { message?: string; code?: string };
    const message = errorData.message || 'Error desconocido';
    const code = errorData.code || 'UNKNOWN';

    switch (response.status) {
      case 429:
        throw new RateLimitError(message);
      case 400:
        if (code === 'ALREADY_VOTED') {
          throw new AlreadyVotedError(message);
        }
        throw new ApiError(400, code, message);
      case 404:
        throw new NotFoundError(message);
      case 500:
        throw new ApiError(500, 'SERVER_ERROR', 'Error interno del servidor');
      default:
        throw new ApiError(response.status, code, message);
    }
  }

  return data as T;
}

/**
 * Filtros para obtener alertas
 */
interface AlertFilters {
  type?: string;
  localityId?: string;
  includeHidden?: boolean;
}

/**
 * API de alertas
 */
export const api = {
  /**
   * Obtiene la lista de alertas con filtros opcionales
   */
  getAlerts: (filters?: AlertFilters): Promise<Alert[]> => {
    const params = new URLSearchParams();

    if (filters?.type) {
      params.set('type', filters.type);
    }
    if (filters?.localityId) {
      params.set('localityId', filters.localityId);
    }
    if (filters?.includeHidden) {
      params.set('includeHidden', 'true');
    }

    const queryString = params.toString();
    const endpoint = `/alerts${queryString ? `?${queryString}` : ''}`;

    return fetchWithDeviceId<Alert[]>(endpoint);
  },

  /**
   * Obtiene una alerta por su ID
   */
  getAlertById: (id: string): Promise<Alert> => {
    return fetchWithDeviceId<Alert>(`/alerts/${id}`);
  },

  /**
   * Crea una nueva alerta
   */
  createAlert: (data: CreateAlertDTO): Promise<Alert> => {
    return fetchWithDeviceId<Alert>('/alerts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Vota en una alerta (confirmar o rechazar)
   */
  voteAlert: (alertId: string, voteType: 'confirm' | 'reject'): Promise<Alert> => {
    return fetchWithDeviceId<Alert>(`/alerts/${alertId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ voteType }),
    });
  },

  /**
   * Health check de la API
   */
  health: (): Promise<{ status: string; timestamp: string }> => {
    return fetchWithDeviceId<{ status: string; timestamp: string }>('/health');
  },

  /**
   * Obtiene la lista de localidades
   */
  getLocalities: (): Promise<Locality[]> => {
    return fetchWithDeviceId<Locality[]>('/localities');
  },
};
