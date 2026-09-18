import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { bookingApi } from '../../services/endpoints'
import { getErrorMessage } from '../../services/api'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { PageSkeleton } from '../../components/ui/Skeleton'
import { formatCurrency, formatDate } from '../../lib/utils'
import { useAuth } from '../../contexts/AuthContext'

const nextAction: Record<string, { label: string; status: string } | null> = {
  pending: { label: 'Accept', status: 'accepted' },
  accepted: { label: 'Start work', status: 'in_progress' },
  in_progress: { label: 'Submit delivery', status: 'submitted' },
  submitted: null,
  completed: null,
  cancelled: null,
}

export default function BookingsPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['bookings'], queryFn: bookingApi.list })

  const update = useMutation({
    mutationFn: ({ id, status, delivery_url }: { id: number; status?: string; delivery_url?: string }) =>
      bookingApi.update(id, { status, delivery_url }),
    onSuccess: () => {
      toast.success('Booking updated')
      qc.invalidateQueries({ queryKey: ['bookings'] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  if (isLoading) return <PageSkeleton />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Bookings</h1>
        <p className="muted mt-1">Milestone workflow from pending to completed.</p>
      </div>
      <div className="space-y-4">
        {(data || []).map((b) => {
          const action =
            user?.role === 'creator'
              ? nextAction[b.status]
              : b.status === 'submitted'
                ? { label: 'Mark completed', status: 'completed' }
                : null
          return (
            <Card key={b.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{b.title}</h3>
                  <p className="muted mt-1">
                    {formatCurrency(b.amount)} · {b.status.replace('_', ' ')} · {formatDate(b.created_at)}
                  </p>
                  {b.milestones?.length ? (
                    <ul className="mt-3 space-y-1 text-sm text-white/60">
                      {b.milestones.map((m) => (
                        <li key={m.id}>
                          {m.is_completed ? '✓' : '○'} {m.title} ({formatCurrency(m.amount)})
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {action ? (
                    <Button
                      onClick={() => {
                        if (action.status === 'submitted') {
                          const url = window.prompt('Delivery URL / link')
                          if (!url) return
                          update.mutate({ id: b.id, status: action.status, delivery_url: url })
                        } else {
                          update.mutate({ id: b.id, status: action.status })
                        }
                      }}
                    >
                      {action.label}
                    </Button>
                  ) : null}
                </div>
              </div>
            </Card>
          )
        })}
        {!data?.length ? <p className="muted">No bookings yet.</p> : null}
      </div>
    </div>
  )
}
