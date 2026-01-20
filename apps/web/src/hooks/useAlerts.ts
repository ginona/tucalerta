import type { AlertType, CreateAlertDTO } from '@tucalerta/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAlertStore } from '@/store/alertStore';

interface AlertFilters {
  type?: AlertType;
  localityId?: string;
  includeHidden?: boolean;
}

interface UseAlertsOptions {
  filters?: AlertFilters;
}

export function useAlerts(options: UseAlertsOptions = {}) {
  const queryClient = useQueryClient();
  const closeForm = useAlertStore((state) => state.closeForm);
  const filters = useAlertStore((state) => state.filters);

  // Combinar filtros de opciones con filtros del store
  const activeFilters = {
    ...filters,
    ...options.filters,
  };

  // Query para obtener alertas
  const alertsQuery = useQuery({
    queryKey: ['alerts', activeFilters],
    queryFn: () => api.getAlerts(activeFilters),
    staleTime: 60000, // 1 minuto
    refetchInterval: 120000, // 2 minutos para updates automáticos
  });

  // Mutation para crear alerta
  const createAlertMutation = useMutation({
    mutationFn: (data: CreateAlertDTO) => api.createAlert(data),
    onSuccess: () => {
      // Invalidar query de alertas para refetch
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      // Cerrar formulario
      closeForm();
    },
  });

  return {
    // Query data
    alerts: alertsQuery.data ?? [],
    isLoading: alertsQuery.isLoading,
    error: alertsQuery.error,
    refetch: alertsQuery.refetch,

    // Mutation
    createAlert: createAlertMutation.mutateAsync,
    isCreating: createAlertMutation.isPending,
    createError: createAlertMutation.error,
  };
}
