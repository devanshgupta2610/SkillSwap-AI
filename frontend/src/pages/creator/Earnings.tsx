import { useQuery } from '@tanstack/react-query'
import { creatorApi, bookingApi } from '../../services/endpoints'
import { StatCard, Card } from '../../components/ui/Card'
import { PageSkeleton } from '../../components/ui/Skeleton'
import { formatCurrency } from '../../lib/utils'

export default function EarningsPage() {
  const dash = useQuery({ queryKey: ['creator-dashboard'], queryFn: creatorApi.dashboard })
  const bookings = useQuery({ queryKey: ['bookings'], queryFn: bookingApi.list })

  if (dash.isLoading || bookings.isLoading) return <PageSkeleton />

  const completed = (bookings.data || []).filter((b) => b.status === 'completed')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Earnings</h1>
        <p className="muted mt-1">Completed milestone payouts at a glance.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Lifetime earned" value={formatCurrency(dash.data?.total_earnings || 0)} />
        <StatCard label="Completed bookings" value={dash.data?.completed_bookings || 0} />
        <StatCard label="Active pipeline" value={dash.data?.active_bookings || 0} />
      </div>
      <div className="space-y-3">
        {completed.map((b) => (
          <Card key={b.id} className="flex justify-between">
            <span>{b.title}</span>
            <span className="font-semibold text-accent-soft">{formatCurrency(b.amount)}</span>
          </Card>
        ))}
        {!completed.length ? <p className="muted">No completed payouts yet.</p> : null}
      </div>
    </div>
  )
}
