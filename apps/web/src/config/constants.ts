import type { Locality } from '@tucalerta/types';

/**
 * Coordenadas del centro de San Miguel de Tucumán
 */
export const TUCUMAN_CENTER: [number, number] = [-26.8083, -65.2176];

/**
 * Zoom inicial del mapa
 */
export const DEFAULT_ZOOM = 11;

/**
 * Zoom mínimo permitido
 */
export const MIN_ZOOM = 10;

/**
 * Zoom máximo permitido
 */
export const MAX_ZOOM = 18;

/**
 * Límites del mapa para Tucumán
 * Evita que el usuario navegue fuera de la provincia
 * [[sur, oeste], [norte, este]]
 */
export const TUCUMAN_BOUNDS: [[number, number], [number, number]] = [
  [-27.6, -66.2], // Suroeste
  [-26.0, -64.4], // Noreste
];

/**
 * Localidades principales de Tucumán
 * Coordenadas del centro de cada localidad
 */
export const LOCALITIES: Locality[] = [
  {
    id: 'san-miguel-de-tucuman',
    name: 'San Miguel de Tucumán',
    coordinates: [-26.8083, -65.2176],
    province: 'tucuman',
  },
  {
    id: 'yerba-buena',
    name: 'Yerba Buena',
    coordinates: [-26.8167, -65.3167],
    province: 'tucuman',
  },
  {
    id: 'tafi-viejo',
    name: 'Tafí Viejo',
    coordinates: [-26.7333, -65.2667],
    province: 'tucuman',
  },
  {
    id: 'banda-del-rio-sali',
    name: 'Banda del Río Salí',
    coordinates: [-26.8333, -65.1833],
    province: 'tucuman',
  },
  {
    id: 'las-talitas',
    name: 'Las Talitas',
    coordinates: [-26.7667, -65.2000],
    province: 'tucuman',
  },
  {
    id: 'alderetes',
    name: 'Alderetes',
    coordinates: [-26.8167, -65.1333],
    province: 'tucuman',
  },
  {
    id: 'concepcion',
    name: 'Concepción',
    coordinates: [-27.3439, -65.5897],
    province: 'tucuman',
  },
  {
    id: 'monteros',
    name: 'Monteros',
    coordinates: [-27.1667, -65.5000],
    province: 'tucuman',
  },
  {
    id: 'famailla',
    name: 'Famaillá',
    coordinates: [-27.0500, -65.4000],
    province: 'tucuman',
  },
  {
    id: 'aguilares',
    name: 'Aguilares',
    coordinates: [-27.4333, -65.6167],
    province: 'tucuman',
  },
  {
    id: 'lules',
    name: 'Lules',
    coordinates: [-26.9333, -65.3333],
    province: 'tucuman',
  },
  {
    id: 'simoca',
    name: 'Simoca',
    coordinates: [-27.2667, -65.3500],
    province: 'tucuman',
  },
];

/**
 * Obtiene una localidad por su ID
 */
export function getLocalityById(id: string): Locality | undefined {
  return LOCALITIES.find((locality) => locality.id === id);
}

/**
 * Configuración de tiles del mapa
 */
export const MAP_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

export const MAP_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

/**
 * Colores por tipo de alerta
 */
export const ALERT_TYPE_COLORS = {
  flood: '#3b82f6', // blue-500
  power_outage: '#f59e0b', // amber-500
} as const;

/**
 * Íconos por tipo de alerta
 */
export const ALERT_TYPE_ICONS = {
  flood: '🌊',
  power_outage: '⚡',
} as const;

/**
 * Colores por severidad
 */
export const SEVERITY_COLORS = {
  1: '#22c55e', // green-500 - Leve
  2: '#f59e0b', // amber-500 - Moderado
  3: '#ef4444', // red-500 - Grave
} as const;

/**
 * Labels por tipo de alerta
 */
export const ALERT_TYPE_LABELS = {
  flood: 'Inundación',
  power_outage: 'Corte de luz',
} as const;

/**
 * Labels por severidad
 */
export const SEVERITY_LABELS = {
  1: 'Leve',
  2: 'Moderado',
  3: 'Grave',
} as const;

/**
 * Labels por estado
 */
export const STATUS_LABELS = {
  active: 'Activa',
  resolved: 'Resuelta',
  investigating: 'En investigación',
} as const;
