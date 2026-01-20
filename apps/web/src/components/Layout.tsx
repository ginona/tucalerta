import { useState, type ReactNode } from 'react';
import EmergencyModal from './EmergencyModal';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const currentYear = new Date().getFullYear();
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {/* Logo SVG */}
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none">
                  {/* Pin de ubicación */}
                  <path 
                    d="M16 2C10.5 2 6 6.5 6 12c0 7.5 10 18 10 18s10-10.5 10-18c0-5.5-4.5-10-10-10z" 
                    fill="#ea580c"
                  />
                  {/* Círculo interior */}
                  <circle cx="16" cy="12" r="4" fill="white"/>
                  {/* Ondas de alerta */}
                  <path 
                    d="M16 8v4M14 10h4" 
                    stroke="#ea580c" 
                    strokeWidth="1.5" 
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">tucalerta</h1>
                <p className="text-xs text-orange-100 hidden sm:block">
                  Alertas Ciudadanas de Tucumán
                </p>
              </div>
            </div>

            {/* Desktop buttons */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-orange-100 bg-orange-600/50 px-2 py-1 rounded-full">
                📍 Tocá el mapa para alertar
              </span>
              <button
                onClick={() => setIsEmergencyOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors text-sm"
              >
                <span>🆘</span>
                <span className="hidden sm:inline">Emergencia</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 relative">{children}</main>

      {/* Sticky Emergency Bar - always visible */}
      <div className="sticky bottom-0 z-30 bg-red-600 text-white shadow-[0_-4px_12px_rgba(0,0,0,0.15)]">
        <button
          onClick={() => setIsEmergencyOpen(true)}
          className="w-full px-3 py-2 flex items-center justify-center gap-2 hover:bg-red-700 active:bg-red-800 transition-colors"
        >
          <span className="text-base">🆘</span>
          <span className="font-semibold text-xs sm:text-sm">EMERGENCIA</span>
          <span className="flex items-center gap-1.5 text-xs sm:text-sm">
            <a 
              href="tel:101" 
              onClick={(e) => e.stopPropagation()}
              className="bg-white/20 px-1.5 py-0.5 rounded font-bold hover:bg-white/30"
            >
              *101
            </a>
            <a 
              href="tel:107" 
              onClick={(e) => e.stopPropagation()}
              className="bg-white/20 px-1.5 py-0.5 rounded font-bold hover:bg-white/30"
            >
              *107
            </a>
            <a 
              href="tel:100" 
              onClick={(e) => e.stopPropagation()}
              className="bg-white/20 px-1.5 py-0.5 rounded font-bold hover:bg-white/30"
            >
              *100
            </a>
          </span>
          <span className="text-xs opacity-75 ml-1">+info</span>
          <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none">
                <path d="M16 2C10.5 2 6 6.5 6 12c0 7.5 10 18 10 18s10-10.5 10-18c0-5.5-4.5-10-10-10z" fill="#f97316"/>
                <circle cx="16" cy="12" r="3" fill="white"/>
              </svg>
              <span className="font-medium text-white text-sm">TucAlerta</span>
              <span className="text-xs text-gray-500">|</span>
              <span className="text-xs text-gray-400">Proyecto ciudadano independiente</span>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>© {currentYear}</span>
              <span>•</span>
              <span>
                Diseñado por{' '}
                <a 
                  href="https://linkedin.com/in/ginonacchio" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-orange-400 hover:text-orange-300 transition-colors"
                >
                  Gino Nacchio
                </a>
              </span>
            </div>
          </div>

          {/* Compact disclaimer */}
          <p className="mt-3 text-xs text-gray-500 text-center sm:text-left">
            ⚠️ Este NO es un servicio oficial del gobierno. La información proviene de reportes ciudadanos.
            Ante emergencias reales, usá los números oficiales o acercate a la comisaría más cercana.
          </p>
        </div>
      </footer>

      {/* Emergency Modal */}
      <EmergencyModal 
        isOpen={isEmergencyOpen} 
        onClose={() => setIsEmergencyOpen(false)} 
      />
    </div>
  );
}
