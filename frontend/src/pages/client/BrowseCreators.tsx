import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { clientApi } from '../../services/endpoints'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { PageSkeleton } from '../../components/ui/Skeleton'
import { Button } from '../../components/ui/Button'

interface CreatorRow {
  id: number
  full_name: string
  headline?: string
  skills?: string[]
  rating_avg: number
  trust_score: number
  hourly_rate?: number
  location?: string
}

export default function BrowseCreatorsPage() {
  const [q, setQ] = useState('')
  const [skill, setSkill] = useState('')
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['creators', q, skill],
    queryFn: () => clientApi.creators({ q: q || undefined, skill: skill || undefined }),
  })

  if (isLoading) return <PageSkeleton />
  const creators = (data || []) as CreatorRow[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Browse creators</h1>
        <p className="muted mt-1">Search by name, headline, or skill.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Input className="max-w-xs" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        <Input className="max-w-xs" placeholder="Skill filter" value={skill} onChange={(e) => setSkill(e.target.value)} />
        <Button variant="ghost" onClick={() => refetch()}>
          Apply
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {creators.map((c) => (
          <Card key={c.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{c.full_name}</h3>
                <p className="muted">{c.headline || 'Creator'}</p>
                <p className="mt-2 text-sm text-white/60">
                  ★ {c.rating_avg.toFixed(1)} · Trust {c.trust_score.toFixed(0)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(c.skills || []).slice(0, 4).map((s) => (
                    <span key={s} className="rounded-lg bg-white/5 px-2 py-1 text-xs">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <Link to={`/client/creators/${c.id}`}>
                <Button variant="ghost">View</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
