import { FormEvent, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { clientApi } from '../../services/endpoints'
import { getErrorMessage } from '../../services/api'
import { Button } from '../../components/ui/Button'
import { Input, Label, Textarea } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import type { MatchResult } from '../../types'

export default function PostJobPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [form, setForm] = useState({
    title: '',
    description: '',
    required_skills: '',
    tags: '',
    budget_min: 1000,
    budget_max: 10000,
  })
  const [matches, setMatches] = useState<MatchResult[]>([])

  const create = useMutation({
    mutationFn: async () => {
      const job = await clientApi.createJob({
        title: form.title,
        description: form.description,
        required_skills: form.required_skills.split(',').map((s) => s.trim()).filter(Boolean),
        tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
        budget_min: Number(form.budget_min),
        budget_max: Number(form.budget_max),
      })
      const m = await clientApi.matches(job.id)
      return { job, matches: m }
    },
    onSuccess: ({ job, matches: m }) => {
      toast.success('Job posted — AI matches ready')
      setMatches(m)
      qc.invalidateQueries({ queryKey: ['client-dashboard'] })
      navigate(`/client/creators?highlight=${m[0]?.creator_id || ''}`, { replace: false })
      // keep matches visible on page briefly via state before navigate — store in session
      sessionStorage.setItem(`matches:${job.id}`, JSON.stringify(m))
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    create.mutate()
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="page-title">Post a job</h1>
        <p className="muted mt-1">AI Talent Match ranks creators by skills, portfolio, and trust.</p>
      </div>
      <Card>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              required
              minLength={20}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <Label>Required skills</Label>
            <Input
              placeholder="React, Figma, Copywriting"
              value={form.required_skills}
              onChange={(e) => setForm({ ...form, required_skills: e.target.value })}
            />
          </div>
          <div>
            <Label>Tags</Label>
            <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Budget min</Label>
              <Input
                type="number"
                value={form.budget_min}
                onChange={(e) => setForm({ ...form, budget_min: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Budget max</Label>
              <Input
                type="number"
                value={form.budget_max}
                onChange={(e) => setForm({ ...form, budget_max: Number(e.target.value) })}
              />
            </div>
          </div>
          <Button disabled={create.isPending}>
            {create.isPending ? 'Matching…' : 'Post & match creators'}
          </Button>
        </form>
      </Card>
      {matches.length ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Top matches</h2>
          {matches.slice(0, 5).map((m) => (
            <Card key={m.creator_id}>
              <div className="flex justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{m.full_name}</h3>
                  <p className="muted">{m.headline}</p>
                  <ul className="mt-2 list-disc pl-5 text-sm text-white/60">
                    {m.matching_reasons.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
                <p className="text-2xl font-bold text-accent-soft">{m.compatibility_score}%</p>
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  )
}
