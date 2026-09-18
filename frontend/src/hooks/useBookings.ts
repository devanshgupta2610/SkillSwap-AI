import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bookingApi } from '../services/endpoints'

export function useBookings() {
  const qc = useQueryClient()
  const list = useQuery({ queryKey: ['bookings'], queryFn: bookingApi.list })
  const update = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
      bookingApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  })
  return { ...list, update }
}
