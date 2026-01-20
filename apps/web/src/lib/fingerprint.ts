const DEVICE_ID_KEY = 'tucalerta_device_id';
const VOTED_ALERTS_KEY = 'tucalerta_voted_alerts';
const LAST_REPORT_KEY = 'tucalerta_last_report';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const ONE_HOUR_MS = 1000; // TODO: cambiar a 60 * 60 * 1000 en producción

interface VotedAlert {
  alertId: string;
  voteType: 'confirm' | 'reject';
  timestamp: number;
}

/**
 * Verifica si localStorage está disponible
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Obtiene o genera un deviceId único para el dispositivo
 */
export function getDeviceId(): string {
  if (!isLocalStorageAvailable()) {
    return crypto.randomUUID();
  }

  let deviceId = localStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
}

/**
 * Obtiene la lista de alertas votadas desde localStorage
 */
function getVotedAlerts(): VotedAlert[] {
  if (!isLocalStorageAvailable()) {
    return [];
  }

  try {
    const stored = localStorage.getItem(VOTED_ALERTS_KEY);
    if (!stored) return [];

    const votedAlerts: VotedAlert[] = JSON.parse(stored);
    const now = Date.now();

    // Filtrar votos antiguos (> 30 días)
    const recentVotes = votedAlerts.filter(
      (vote) => now - vote.timestamp < THIRTY_DAYS_MS
    );

    if (recentVotes.length !== votedAlerts.length) {
      localStorage.setItem(VOTED_ALERTS_KEY, JSON.stringify(recentVotes));
    }

    return recentVotes;
  } catch {
    return [];
  }
}

/**
 * Verifica si el usuario ya votó en una alerta
 */
export function hasVoted(alertId: string): boolean {
  const votedAlerts = getVotedAlerts();
  return votedAlerts.some((vote) => vote.alertId === alertId);
}

/**
 * Obtiene el tipo de voto que el usuario hizo
 */
export function getVoteType(alertId: string): 'confirm' | 'reject' | null {
  const votedAlerts = getVotedAlerts();
  const vote = votedAlerts.find((v) => v.alertId === alertId);
  return vote?.voteType ?? null;
}

/**
 * Marca una alerta como votada (alias de markAsVoted)
 */
export function recordVote(alertId: string, voteType: 'confirm' | 'reject' = 'confirm'): void {
  markAsVoted(alertId, voteType);
}

/**
 * Marca una alerta como votada
 */
export function markAsVoted(alertId: string, voteType: 'confirm' | 'reject'): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    const votedAlerts = getVotedAlerts();

    if (votedAlerts.some((vote) => vote.alertId === alertId)) {
      return;
    }

    votedAlerts.push({
      alertId,
      voteType,
      timestamp: Date.now(),
    });

    localStorage.setItem(VOTED_ALERTS_KEY, JSON.stringify(votedAlerts));
  } catch (error) {
    console.error('Error saving vote:', error);
  }
}

/**
 * Verifica si el usuario puede reportar (rate limit de 1 hora)
 */
export function canReport(): boolean {
  if (!isLocalStorageAvailable()) {
    return true;
  }

  const lastReport = localStorage.getItem(LAST_REPORT_KEY);
  if (!lastReport) return true;

  const lastReportTime = parseInt(lastReport, 10);
  return Date.now() - lastReportTime >= ONE_HOUR_MS;
}

/**
 * Obtiene el tiempo restante hasta poder reportar (en minutos)
 */
export function getTimeUntilCanReport(): number {
  if (!isLocalStorageAvailable()) {
    return 0;
  }

  const lastReport = localStorage.getItem(LAST_REPORT_KEY);
  if (!lastReport) return 0;

  const lastReportTime = parseInt(lastReport, 10);
  const elapsed = Date.now() - lastReportTime;
  const remaining = ONE_HOUR_MS - elapsed;

  return Math.max(0, Math.ceil(remaining / 60000));
}

/**
 * Registra que se hizo un reporte
 */
export function recordReport(): void {
  if (isLocalStorageAvailable()) {
    localStorage.setItem(LAST_REPORT_KEY, Date.now().toString());
  }
}

/**
 * Limpia todos los votos del localStorage
 */
export function clearVotes(): void {
  if (isLocalStorageAvailable()) {
    localStorage.removeItem(VOTED_ALERTS_KEY);
  }
}
