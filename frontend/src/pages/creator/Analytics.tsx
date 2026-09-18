import { useQuery } from '@tanstack/react-query'
import { creatorApi } from '../../services/endpoints'
import { Card, StatCard } from '../../components/ui/Card'
import { PageSkeleton } from '../../components/ui/Skeleton'
import { formatCurrency } from '../../lib/utils'

export default function CreatorAnalyticsPage() {
  const { data, isLoading } = useQuery({ queryKey: ['creator-analytics'], queryFn: creatorApi.analytics })

  if (isLoading || !data) return <PageSkeleton />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Analytics</h1>
        <p className="muted mt-1">Views, orders, and booking funnel.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Gig views" value={data.views} />
        <StatCard label="Orders" value={data.orders} />
        <StatCard label="Completed revenue" value={formatCurrency(data.revenue_completed)} />
      </div>
      <Card>
        <h2 className="font-semibold">Bookings by status</h2>
        <ul className="mt-4 space-y-2 text-sm text-white/70">
          {Object.entries(data.bookings_by_status || {}).map(([k, v]) => (
            <li key={k} className="flex justify-between border-b border-white/5 py-2">
              <span className="capitalize">{k.replace('_', ' ')}</span>
              <span>{String(v)}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
