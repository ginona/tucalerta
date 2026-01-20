import type { Alert } from '@tucalerta/types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import {
  ALERT_TYPE_LABELS,
  SEVERITY_COLORS,
  SEVERITY_LABELS,
} from '@/config/constants';
import { hasVoted, recordVote } from '@/lib/fingerprint';

interface AlertCardProps {
  alert: Alert;
  onVote?: (alertId: string, voteType: 'confirm' | 'reject') => void;
  compact?: boolean;
}

export default function AlertCard({ alert, onVote, compact = false }: AlertCardProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [voted, setVoted] = useState(() => hasVoted(alert.id));

  const alertIcon = alert.type === 'flood' ? '🌊' : '⚡';
  const alertTitle = ALERT_TYPE_LABELS[alert.type];
  const severityColor = SEVERITY_COLORS[alert.severity];
  const severityLabel = SEVERITY_LABELS[alert.severity];

  const handleVote = async (voteType: 'confirm' | 'reject') => {
    if (voted || isVoting) return;

    setIsVoting(true);
    try {
      await onVote?.(alert.id, voteType);
      recordVote(alert.id);
      setVoted(true);
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(alert.createdAt), {
    addSuffix: true,
    locale: es,
  });

  const scoreColor =
    alert.validationScore >= 3
      ? 'text-green-600'
      : alert.validationScore < -3
        ? 'text-red-600'
        : 'text-gray-600';

  return (
    <div className={`bg-white rounded-lg ${compact ? 'p-3' : 'p-4'} w-full`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{alertIcon}</span>
          <div>
            <h3 className={`font-semibold text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>
              {alertTitle}
            </h3>
            <p className="text-xs text-gray-500">{alert.locality.name}</p>
          </div>
        </div>
        <span
          className="px-2 py-1 rounded-full text-xs font-medium text-white"
          style={{ backgroundColor: severityColor }}
        >
          {severityLabel}
        </span>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 mb-2 italic">
        Reporte ciudadano — no verificado
      </p>

      {/* Status badges */}
      {alert.isVerified && (
        <div className="mb-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md inline-flex items-center gap-1">
          <span>✓</span> Verificado por la comunidad
        </div>
      )}
      {alert.autoHidden && (
        <div className="mb-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-md inline-flex items-center gap-1">
          <span>⚠</span> Reportado como falso
        </div>
      )}

      {/* Timestamp */}
      <p className="text-xs text-gray-500 mb-3">⏱️ {timeAgo}</p>

      {/* Voting section */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleVote('confirm')}
            disabled={voted || isVoting}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${voted || isVoting
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-50 text-green-700 hover:bg-green-100 active:scale-95'
              }`}
          >
            <span>👍</span>
            <span>{alert.confirmations}</span>
          </button>

          <button
            onClick={() => handleVote('reject')}
            disabled={voted || isVoting}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${voted || isVoting
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-red-50 text-red-700 hover:bg-red-100 active:scale-95'
              }`}
          >
            <span>👎</span>
            <span>{alert.rejections}</span>
          </button>
        </div>

        <div className={`text-sm font-medium ${scoreColor}`}>
          {alert.validationScore > 0 ? '+' : ''}
          {alert.validationScore}
        </div>
      </div>

      {voted && (
        <p className="text-xs text-gray-400 mt-2 text-center">Ya votaste en esta alerta</p>
      )}
    </div>
  );
}
