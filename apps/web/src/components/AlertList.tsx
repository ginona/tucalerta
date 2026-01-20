import type { Alert, AlertType } from '@tucalerta/types';
import { useState } from 'react';
import { ALERT_TYPE_LABELS, LOCALITIES } from '@/config/constants';
import AlertCard from './AlertCard';

interface AlertListProps {
  alerts: Alert[];
  isLoading?: boolean;
  onVote?: (alertId: string, voteType: 'confirm' | 'reject') => void;
  onAlertClick?: (alert: Alert) => void;
}

export default function AlertList({ alerts, isLoading, onVote, onAlertClick }: AlertListProps) {
  const [typeFilter, setTypeFilter] = useState<AlertType | 'all'>('all');
  const [localityFilter, setLocalityFilter] = useState<string>('all');
  const [showHidden, setShowHidden] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Apply filters
  const filteredAlerts = alerts.filter((alert) => {
    if (typeFilter !== 'all' && alert.type !== typeFilter) return false;
    if (localityFilter !== 'all' && alert.locality.id !== localityFilter) return false;
    if (!showHidden && alert.autoHidden) return false;
    return true;
  });

  const activeCount = alerts.filter((a) => !a.autoHidden).length;

  // Get icon for alert type
  const getAlertIcon = (type: AlertType) => type === 'flood' ? '🌊' : '⚡';

  return (
    <>
      {/* Mobile Ticker - positioned over map */}
      <div className="lg:hidden absolute top-2 left-2 right-2 z-20">
        {/* Ticker bar */}
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden"
        >
          <div className="flex items-center">
            {/* Badge */}
            <div className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-orange-500 text-white">
              <span className="text-sm">🚨</span>
              <span className="font-bold text-sm">{activeCount}</span>
            </div>
            
            {/* Scrolling ticker */}
            <div className="flex-1 overflow-hidden py-2 px-2">
              {activeCount > 0 ? (
                <div className="animate-ticker flex gap-6 whitespace-nowrap">
                  {filteredAlerts.filter(a => !a.autoHidden).slice(0, 10).map((alert) => (
                    <span key={alert.id} className="inline-flex items-center gap-1.5 text-sm text-gray-700">
                      <span>{getAlertIcon(alert.type)}</span>
                      <span className="font-medium">{alert.locality.name}:</span>
                      <span className="text-gray-600 max-w-[150px] truncate">{alert.description}</span>
                    </span>
                  ))}
                  {/* Duplicate for seamless loop */}
                  {filteredAlerts.filter(a => !a.autoHidden).slice(0, 10).map((alert) => (
                    <span key={`dup-${alert.id}`} className="inline-flex items-center gap-1.5 text-sm text-gray-700">
                      <span>{getAlertIcon(alert.type)}</span>
                      <span className="font-medium">{alert.locality.name}:</span>
                      <span className="text-gray-600 max-w-[150px] truncate">{alert.description}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-gray-500">Sin alertas activas</span>
              )}
            </div>
            
            {/* Arrow indicator */}
            <div className="shrink-0 px-2 text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </button>
      </div>

      {/* Mobile Expanded Panel (modal-like) */}
      {isExpanded && (
        <div className="lg:hidden fixed inset-0 z-40">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setIsExpanded(false)}
          />
          
          {/* Panel */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl max-h-[75vh] flex flex-col animate-sheet-up">
            {/* Handle */}
            <button
              onClick={() => setIsExpanded(false)}
              className="w-full py-3 flex flex-col items-center shrink-0"
            >
              <div className="w-10 h-1 bg-gray-300 rounded-full mb-2" />
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-gray-900">Alertas Activas</h2>
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                  {activeCount}
                </span>
              </div>
            </button>

            <div className="px-4 pb-4 overflow-y-auto flex-1">
              {/* Filters */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as AlertType | 'all')}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white"
                >
                  <option value="all">Todos los tipos</option>
                  {Object.entries(ALERT_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>

                <select
                  value={localityFilter}
                  onChange={(e) => setLocalityFilter(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white"
                >
                  <option value="all">Todas las localidades</option>
                  {LOCALITIES.map((locality) => (
                    <option key={locality.id} value={locality.id}>
                      {locality.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Alerts */}
              <div className="space-y-3">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-2 border-orange-600/30 border-t-orange-600 rounded-full animate-spin" />
                  </div>
                ) : filteredAlerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-4xl mb-2">🔍</p>
                    <p>No hay alertas en esta área</p>
                  </div>
                ) : (
                  filteredAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => onAlertClick?.(alert)}
                      className="cursor-pointer hover:shadow-md transition-shadow rounded-lg border border-gray-200"
                    >
                      <AlertCard alert={alert} onVote={onVote} compact />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block absolute top-0 right-0 h-full w-96 bg-white shadow-xl z-20 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Alertas Activas</h2>
            <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {activeCount}
            </span>
          </div>

          {/* Filters */}
          <div className="space-y-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as AlertType | 'all')}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los tipos</option>
              {Object.entries(ALERT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <select
              value={localityFilter}
              onChange={(e) => setLocalityFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas las localidades</option>
              {LOCALITIES.map((locality) => (
                <option key={locality.id} value={locality.id}>
                  {locality.name}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showHidden}
                onChange={(e) => setShowHidden(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              Mostrar reportados como falsos
            </label>
          </div>
        </div>

        {/* Alerts list */}
        <div className="overflow-y-auto h-[calc(100%-180px)] p-4">
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-10 h-10 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-5xl mb-3">🔍</p>
                <p className="text-lg font-medium">No hay alertas</p>
                <p className="text-sm">en esta área</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => onAlertClick?.(alert)}
                  className="cursor-pointer hover:shadow-md transition-shadow rounded-lg border border-gray-200"
                >
                  <AlertCard alert={alert} onVote={onVote} compact />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
