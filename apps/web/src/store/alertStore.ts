import type { Alert, AlertType } from '@tucalerta/types';
import { create } from 'zustand';

interface AlertFilters {
  type?: AlertType;
  localityId?: string;
  includeHidden: boolean;
}

interface AlertState {
  // Estado
  selectedAlert: Alert | null;
  isFormOpen: boolean;
  formCoordinates: [number, number] | null;
  filters: AlertFilters;

  // Actions
  setSelectedAlert: (alert: Alert | null) => void;
  openForm: (coordinates?: [number, number]) => void;
  closeForm: () => void;
  setFilters: (filters: Partial<AlertFilters>) => void;
  resetFilters: () => void;
}

const initialFilters: AlertFilters = {
  type: undefined,
  localityId: undefined,
  includeHidden: false,
};

export const useAlertStore = create<AlertState>((set) => ({
  // Estado inicial
  selectedAlert: null,
  isFormOpen: false,
  formCoordinates: null,
  filters: initialFilters,

  // Actions
  setSelectedAlert: (alert) =>
    set({ selectedAlert: alert }),

  openForm: (coordinates) =>
    set({
      isFormOpen: true,
      formCoordinates: coordinates ?? null,
    }),

  closeForm: () =>
    set({
      isFormOpen: false,
      formCoordinates: null,
    }),

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  resetFilters: () =>
    set({ filters: initialFilters }),
}));
