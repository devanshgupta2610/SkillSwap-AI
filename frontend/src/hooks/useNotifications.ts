import { useQuery } from '@tanstack/react-query'
import { sharedApi } from '../services/endpoints'

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: sharedApi.notifications,
    refetchInterval: 15000,
  })
}
