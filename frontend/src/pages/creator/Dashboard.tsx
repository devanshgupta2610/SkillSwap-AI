import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { creatorApi } from '../../services/endpoints'
import { StatCard } from '../../components/ui/Card'
import { PageSkeleton } from '../../components/ui/Skeleton'
import { formatCurrency } from '../../lib/utils'
import { Button } from '../../components/ui/Button'

export default function CreatorDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['creator-dashboard'], queryFn: creatorApi.dashboard })

  if (isLoading || !data) return <PageSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Creator dashboard</h1>
          <p className="muted mt-1">Track bookings, portfolio strength, and earnings.</p>
        </div>
        <Link to="/creator/ai-builder">
          <Button>Build with AI</Button>
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total earnings" value={formatCurrency(data.total_earnings)} />
        <StatCard label="Active bookings" value={data.active_bookings} />
        <StatCard label="Completed" value={data.completed_bookings} />
        <StatCard label="Avg rating" value={data.avg_rating.toFixed(1)} hint={`${data.portfolio_count} portfolio items`} />
      </div>
      <div className="glass p-6">
        <h2 className="text-lg font-semibold">Next actions</h2>
        <ul className="mt-4 space-y-2 text-sm text-white/70">
          <li>• Generate an AI portfolio card from a recent project</li>
          <li>• Publish a gig with suggested pricing</li>
          <li>• Accept pending bookings and set milestones</li>
        </ul>
      </div>
    </div>
  )
}
