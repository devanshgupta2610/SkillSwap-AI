import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { sharedApi } from '../../services/endpoints'
import { getErrorMessage } from '../../services/api'
import { Card } from '../../components/ui/Card'
import { PageSkeleton } from '../../components/ui/Skeleton'
import { formatDate } from '../../lib/utils'
import { Button } from '../../components/ui/Button'

export default function NotificationsPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['notifications'], queryFn: sharedApi.notifications })
  const mark = useMutation({
    mutationFn: (id: number) => sharedApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  if (isLoading) return <PageSkeleton />

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="page-title">Notifications</h1>
        <p className="muted mt-1">Bookings, messages, and social signals.</p>
      </div>
      <div className="space-y-3">
        {(data || []).map((n) => (
          <Card key={n.id} className={n.is_read ? 'opacity-60' : ''}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-medium">{n.title}</h3>
                <p className="mt-1 text-sm text-white/65">{n.body}</p>
                <p className="mt-2 text-xs text-white/35">{formatDate(n.created_at)}</p>
              </div>
              {!n.is_read ? (
                <Button variant="ghost" onClick={() => mark.mutate(n.id)}>
                  Mark read
                </Button>
              ) : null}
            </div>
          </Card>
        ))}
        {!data?.length ? <p className="muted">You are all caught up.</p> : null}
      </div>
    </div>
  )
}
