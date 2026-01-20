import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertForm, AlertList, Layout, Map } from '@/components';
import { useAlerts } from '@/hooks/useAlerts';
import { useVote } from '@/hooks/useVote';
import { useAlertStore } from '@/store/alertStore';

// =============================================================================
// Query Client
// =============================================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 2,
      refetchOnWindowFocus: true,
    },
  },
});

// =============================================================================
// Error Boundary
// =============================================================================

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error capturado:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="text-center max-w-md">
            <h1 className="text-4xl mb-4">😵</h1>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Algo salió mal
            </h2>
            <p className="text-gray-600 mb-4">
              Ha ocurrido un error inesperado. Por favor, recarga la página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// =============================================================================
// Toast Component (Simple)
// =============================================================================

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  return (
    <div
      className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in
        ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
    >
      <span>{type === 'success' ? '✓' : '✕'}</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70">✕</button>
    </div>
  );
}

// =============================================================================
// Main App Content
// =============================================================================

function AppContent() {
  const { isFormOpen, formCoordinates, openForm, closeForm } = useAlertStore();
  const { alerts, isLoading, createAlert } = useAlerts();
  const { vote } = useVote();

  // Toast state
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleMapClick = (lat: number, lng: number) => {
    openForm([lat, lng]);
  };

  const handleNewAlert = () => {
    openForm();
  };

  const handleCreateAlert = async (data: Parameters<typeof createAlert>[0]) => {
    try {
      await createAlert(data);
      showToast('¡Alerta creada exitosamente!', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Error al crear alerta', 'error');
      throw error;
    }
  };

  const handleVote = async (alertId: string, voteType: 'confirm' | 'reject') => {
    try {
      await vote({ alertId, voteType });
      showToast(
        voteType === 'confirm' ? '¡Gracias por confirmar!' : 'Reporte registrado',
        'success'
      );
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Error al votar', 'error');
    }
  };

  return (
    <Layout>
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-10 bg-white/50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-600">Cargando alertas...</p>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="h-[calc(100vh-120px)] lg:h-[calc(100vh-64px)] relative">
        <Map
          alerts={alerts}
          onMapClick={handleMapClick}
          onVote={handleVote}
          selectedPosition={formCoordinates}
        />

        {/* Alert List (Sidebar/Bottom Sheet) */}
        <AlertList
          alerts={alerts}
          isLoading={isLoading}
          onVote={handleVote}
        />
      </div>

      {/* Alert Form Modal */}
      <AlertForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleCreateAlert}
        selectedPosition={formCoordinates}
      />
    </Layout>
  );
}

// Need React import for useState
import React from 'react';

// =============================================================================
// App Entry
// =============================================================================

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
