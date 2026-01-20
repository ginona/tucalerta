import type { Alert } from '@tucalerta/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, AlreadyVotedError } from '@/lib/api';
import { hasVoted, markAsVoted } from '@/lib/fingerprint';

interface VoteParams {
  alertId: string;
  voteType: 'confirm' | 'reject';
}

export function useVote() {
  const queryClient = useQueryClient();

  const voteMutation = useMutation({
    mutationFn: async ({ alertId, voteType }: VoteParams): Promise<Alert> => {
      // Validar localmente antes de llamar a la API
      if (hasVoted(alertId)) {
        throw new AlreadyVotedError('Ya votaste en esta alerta');
      }

      return api.voteAlert(alertId, voteType);
    },
    onSuccess: (_, { alertId, voteType }) => {
      // Marcar como votado en localStorage
      markAsVoted(alertId, voteType);

      // Invalidar query de alertas para refetch
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  return {
    vote: voteMutation.mutateAsync,
    isVoting: voteMutation.isPending,
    error: voteMutation.error,
    reset: voteMutation.reset,
  };
}

/**
 * Hook helper para verificar si ya se votó en una alerta
 */
export function useHasVoted(alertId: string): boolean {
  return hasVoted(alertId);
}
