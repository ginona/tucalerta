import { useCallback, useEffect, useState } from 'react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMERGENCY_NUMBERS = [
  { name: 'Bomberos', number: '*100', alt: '423-3553', icon: '🚒' },
  { name: 'Policía', number: '*101', alt: '432-3491', icon: '👮' },
  { name: 'Emergencia Médica', number: '*107', alt: '421-6307', icon: '🚑' },
  { name: 'Emergencia Ambiental', number: '*105', alt: '421-7460', icon: '🌿' },
  { name: 'Defensa Civil', number: '*103', alt: '421-8507', icon: '🛡️' },
  { name: 'Tribunales', number: '424-8000', alt: '', icon: '⚖️' },
  { name: 'Secretaría de Seguridad', number: '422-2466', alt: '', icon: '🏛️' },
];

export default function EmergencyModal({ isOpen, onClose }: EmergencyModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsClosing(false);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isClosing) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isClosing]);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  }, [isClosing, onClose]);

  if (!isOpen && !isClosing) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-title"
      className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center sm:p-4"
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={`relative w-full bg-white rounded-t-[20px] shadow-2xl flex flex-col
          transition-transform duration-300 ease-out
          max-h-[95dvh] sm:max-w-lg sm:max-h-[90vh] sm:rounded-2xl
          ${isClosing ? 'translate-y-full sm:translate-y-0 sm:scale-95 sm:opacity-0' : 'translate-y-0 animate-sheet-up'}
        `}
      >
        {/* Handle bar */}
        <div className="shrink-0 flex justify-center py-3 sm:py-2">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full sm:hidden" />
        </div>

        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-5 pb-3 sm:pt-2 sm:pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🆘</span>
            <h2 id="emergency-title" className="text-xl font-bold text-gray-900">
              Información de Emergencia
            </h2>
          </div>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-5 space-y-5">
            {/* Emergency numbers */}
            <div>
              <h3 className="text-sm font-bold text-red-700 uppercase tracking-wide mb-3">
                📞 Teléfonos de Emergencia
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {EMERGENCY_NUMBERS.map((item) => (
                  <a
                    key={item.number}
                    href={`tel:${item.number.replace('*', '')}`}
                    className="bg-red-50 rounded-xl p-3 border-2 border-red-100 hover:border-red-300 hover:bg-red-100 transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-bold text-red-700 text-lg">{item.number}</span>
                    </div>
                    <div className="text-xs text-red-600 font-medium">{item.name}</div>
                    {item.alt && (
                      <div className="text-xs text-gray-500 mt-0.5">Alt: {item.alt}</div>
                    )}
                  </a>
                ))}
              </div>
              <a
                href="https://www.policiadetucuman.gov.ar/telefonosutiles.htm"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-2 text-sm text-red-600 hover:text-red-800 font-medium"
              >
                <span>🔗</span>
                Ver todos los teléfonos oficiales
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <span className="text-xl shrink-0">⚠️</span>
                <div className="text-sm text-amber-900">
                  <p className="font-bold mb-2">AVISO IMPORTANTE</p>
                  <p className="mb-2">
                    <strong>TucAlerta</strong> es un <strong>proyecto privado e independiente</strong> creado 
                    por un ciudadano como herramienta de apoyo informativo.
                  </p>
                  <p className="mb-2">
                    <strong>NO es un servicio oficial</strong> del gobierno ni de ninguna institución pública.
                  </p>
                  <p>
                    La información publicada proviene de reportes ciudadanos y{' '}
                    <strong>puede no ser exacta o estar actualizada</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* What to do */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span>📋</span>
                ¿Qué hacer ante una emergencia real?
              </h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Llamá inmediatamente a los números de emergencia oficiales</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Acércate a la comisaría más cercana para hacer una denuncia formal</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>No confíes únicamente en reportes de esta app para tomar decisiones</span>
                </li>
              </ul>
            </div>

            {/* Links */}
            <div className="flex flex-col gap-2">
              <a
                href="https://www.policiadetucuman.gov.ar/comisarias.htm"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <span>🏢</span>
                  Encontrar comisaría más cercana
                </span>
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="https://www.policiadetucuman.gov.ar"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <span>🌐</span>
                  Policía de Tucumán (sitio oficial)
                </span>
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-gray-100 p-4 pb-safe bg-gray-50">
          <p className="text-xs text-center text-gray-500">
            © {new Date().getFullYear()} TucAlerta - Proyecto ciudadano independiente
          </p>
        </div>
      </div>
    </div>
  );
}
