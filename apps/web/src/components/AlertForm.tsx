import type { AlertSeverity, AlertType, CreateAlertDTO, Locality } from '@tucalerta/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ALERT_TYPE_LABELS, SEVERITY_LABELS } from '@/config/constants';
import { canReport, getDeviceId, getTimeUntilCanReport, recordReport } from '@/lib/fingerprint';
import { api } from '@/lib/api';

interface AlertFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAlertDTO) => Promise<void>;
  selectedPosition: [number, number] | null;
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export default function AlertForm({ isOpen, onClose, onSubmit, selectedPosition }: AlertFormProps) {
  const [type, setType] = useState<AlertType>('flood');
  const [localityId, setLocalityId] = useState('');
  const [severity, setSeverity] = useState<AlertSeverity>(2);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [isClosing, setIsClosing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);

  useEffect(() => {
    api.getLocalities().then(setLocalities).catch(console.error);
  }, []);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Reset closing state when opening
      setIsClosing(false);
      setDragY(0);
      // Focus after animation
      setTimeout(() => modalRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isClosing) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isClosing]);

  const canSubmit = canReport();
  const timeRemaining = getTimeUntilCanReport();

  const resetForm = () => {
    setType('flood');
    setLocalityId('');
    setDescription('');
    setSeverity(2);
    setStatus('idle');
    setErrorMessage('');
    setDragY(0);
  };

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    // Wait for animation to complete
    setTimeout(() => {
      resetForm();
      setIsClosing(false);
      onClose();
    }, 300);
  }, [isClosing, onClose]);

  // Touch handlers for drag to dismiss
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startYRef.current = touch.clientY;
    currentYRef.current = touch.clientY;
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    currentYRef.current = touch.clientY;
    const deltaY = Math.max(0, touch.clientY - startYRef.current);
    setDragY(deltaY);
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const deltaY = currentYRef.current - startYRef.current;
    // If dragged more than 100px down, close the modal
    if (deltaY > 100) {
      handleClose();
    } else {
      // Snap back
      setDragY(0);
    }
  }, [isDragging, handleClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPosition) {
      setErrorMessage('Selecciona una ubicación en el mapa');
      setStatus('error');
      return;
    }

    if (!localityId) {
      setErrorMessage('Selecciona una localidad');
      setStatus('error');
      return;
    }

    if (!canSubmit) {
      setErrorMessage(`Debes esperar ${timeRemaining} minutos para reportar otra alerta`);
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      await onSubmit({
        type,
        localityId,
        coordinates: selectedPosition,
        description: 'Reporte ciudadano',
        severity,
        deviceId: getDeviceId(),
      });

      recordReport();
      setStatus('success');

      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Error al enviar la alerta');
    }
  };

  if (!isOpen && !isClosing) return null;

  const sheetTransform = isDragging 
    ? `translateY(${dragY}px)` 
    : isClosing 
      ? 'translateY(100%)' 
      : 'translateY(0)';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-40 flex flex-col justify-end sm:flex-row sm:items-center sm:justify-center sm:p-4"
    >
      {/* Backdrop with fade animation */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={`relative w-full bg-white rounded-t-[20px] shadow-2xl flex flex-col
          transition-transform duration-300 ease-out
          max-h-[90dvh] sm:max-w-lg sm:max-h-[85vh] sm:mb-4 sm:mx-auto sm:rounded-2xl
          ${!isClosing && !isDragging ? 'animate-sheet-up' : ''}
        `}
        style={{ 
          transform: sheetTransform,
          willChange: 'transform'
        }}
      >
        {/* Handle bar - visible on mobile for drag to dismiss */}
        <div 
          className="shrink-0 flex justify-center py-3 cursor-grab active:cursor-grabbing touch-none sm:py-2"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full sm:hidden" />
        </div>

        {/* Header */}
        <div 
          ref={modalRef}
          tabIndex={-1}
          className="shrink-0 flex items-center justify-between px-5 pb-3 sm:pt-2 sm:pb-4 sm:border-b sm:border-gray-100 outline-none"
        >
          <h2 id="modal-title" className="text-xl font-bold text-gray-900">
            Nueva Alerta
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form with internal scroll */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto overscroll-contain">
          <div className="px-5 py-4 space-y-5">
            {/* Rate limit warning */}
            {!canSubmit && (
              <div role="alert" className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                <span className="text-xl">⏱️</span>
                <div>
                  <p className="font-medium text-amber-800">Espera un momento</p>
                  <p className="text-sm text-amber-700 mt-0.5">
                    Podrás reportar otra alerta en {timeRemaining} minutos
                  </p>
                </div>
              </div>
            )}

            {/* Selected position indicator */}
            {selectedPosition ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <span className="text-xl">📍</span>
                <div>
                  <p className="font-medium text-emerald-800">Ubicación seleccionada</p>
                  <p className="text-sm text-emerald-700 font-mono mt-0.5">
                    {selectedPosition[0].toFixed(5)}, {selectedPosition[1].toFixed(5)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-start gap-3">
                <span className="text-xl">👆</span>
                <div>
                  <p className="font-medium text-orange-800">Selecciona ubicación</p>
                  <p className="text-sm text-orange-700 mt-0.5">
                    Toca en el mapa para marcar el punto exacto
                  </p>
                </div>
              </div>
            )}

            {/* Alert type */}
            <div className="space-y-2">
              <label htmlFor="alert-type" className="block text-sm font-semibold text-gray-700">
                Tipo de alerta
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(ALERT_TYPE_LABELS).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setType(value as AlertType)}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all active:scale-[0.98]
                      ${type === value 
                        ? value === 'flood'
                          ? 'border-sky-500 bg-sky-50' 
                          : 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                  >
                    <span className="text-3xl">{value === 'flood' ? '🌊' : '⚡'}</span>
                    <span className={`font-medium ${type === value ? 'text-gray-900' : 'text-gray-600'}`}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Locality */}
            <div className="space-y-2">
              <label htmlFor="locality" className="block text-sm font-semibold text-gray-700">
                Localidad
              </label>
              <select
                id="locality"
                value={localityId}
                onChange={(e) => setLocalityId(e.target.value)}
                className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white appearance-none"
                style={{ 
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.75rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="">Selecciona una localidad</option>
                {localities.map((locality) => (
                  <option key={locality.id} value={locality.id}>
                    {locality.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            {/* Severity */}
            <fieldset className="space-y-2">
              <legend className="block text-sm font-semibold text-gray-700">
                Severidad
              </legend>
              <div className="grid grid-cols-3 gap-2">
                {([1, 2, 3] as AlertSeverity[]).map((level) => {
                  const isSelected = severity === level;
                  const colors = {
                    1: { bg: 'bg-emerald-50', border: 'border-emerald-500', text: 'text-emerald-700', icon: '😊' },
                    2: { bg: 'bg-amber-50', border: 'border-amber-500', text: 'text-amber-700', icon: '😐' },
                    3: { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-700', icon: '😰' },
                  };
                  const color = colors[level];
                  
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSeverity(level)}
                      aria-pressed={isSelected}
                      className={`py-3 px-2 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all active:scale-[0.98]
                        ${isSelected 
                          ? `${color.border} ${color.bg} ${color.text}` 
                          : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                      <span className="text-xl">{color.icon}</span>
                      <span className="text-sm font-medium">{SEVERITY_LABELS[level]}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* Error message */}
            {status === 'error' && errorMessage && (
              <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 animate-shake">
                <span className="text-xl">❌</span>
                <p className="text-sm text-red-800 font-medium">{errorMessage}</p>
              </div>
            )}

            {/* Success message */}
            {status === 'success' && (
              <div role="status" className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <span className="text-xl">✅</span>
                <div>
                  <p className="font-medium text-emerald-800">¡Alerta enviada!</p>
                  <p className="text-sm text-emerald-700 mt-0.5">Gracias por tu reporte</p>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons - sticky at bottom */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-4 pb-safe flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={status === 'loading'}
              className="flex-1 py-4 px-4 bg-gray-100 rounded-2xl text-gray-700 font-semibold hover:bg-gray-200 active:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={status === 'loading' || status === 'success' || !canSubmit}
              className="flex-1 py-4 px-4 bg-orange-500 text-white rounded-2xl font-semibold hover:bg-orange-600 active:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {status === 'loading' ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enviando...
                </span>
              ) : (
                'Enviar Alerta'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
