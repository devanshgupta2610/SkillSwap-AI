import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { creatorApi } from '../../services/endpoints'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { PageSkeleton } from '../../components/ui/Skeleton'

export default function CreatorPortfolioPage() {
  const { data, isLoading } = useQuery({ queryKey: ['portfolio'], queryFn: creatorApi.portfolio })

  if (isLoading) return <PageSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Portfolio</h1>
          <p className="muted mt-1">Proof-of-skill cards that power matching.</p>
        </div>
        <Link to="/creator/ai-builder">
          <Button>Add with AI</Button>
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {(data || []).map((p) => (
          <Card key={p.id} className="overflow-hidden p-0">
            {p.image_url ? (
              <img src={p.image_url} alt="" className="h-40 w-full object-cover" />
            ) : (
              <div className="flex h-40 items-center justify-center bg-accent/10 text-accent">Portfolio</div>
            )}
            <div className="p-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold">{p.title}</h3>
                {p.ai_generated ? (
                  <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent-soft">AI</span>
                ) : null}
              </div>
              <p className="mt-2 line-clamp-3 text-sm text-white/60">{p.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(p.skills_used || []).slice(0, 5).map((s) => (
                  <span key={s} className="rounded-lg bg-white/5 px-2 py-1 text-xs text-white/70">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        ))}
        {!data?.length ? <p className="muted">No projects yet. Generate your first AI portfolio card.</p> : null}
      </div>
    </div>
  )
}
