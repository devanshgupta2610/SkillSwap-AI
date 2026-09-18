import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { clientApi } from '../../services/endpoints'
import { StatCard } from '../../components/ui/Card'
import { PageSkeleton } from '../../components/ui/Skeleton'
import { Button } from '../../components/ui/Button'
import { formatCurrency } from '../../lib/utils'

export default function ClientDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['client-dashboard'], queryFn: clientApi.dashboard })
  if (isLoading || !data) return <PageSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Client dashboard</h1>
          <p className="muted mt-1">Post jobs, match talent, and track deliveries.</p>
        </div>
        <Link to="/client/post-job">
          <Button>Post a job</Button>
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Spend (completed)" value={formatCurrency(data.total_earnings)} />
        <StatCard label="Active bookings" value={data.active_bookings} />
        <StatCard label="Open jobs" value={data.open_jobs} />
        <StatCard label="Saved creators" value={data.saved_items} />
      </div>
    </div>
  )
}
