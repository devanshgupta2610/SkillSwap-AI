import { FormEvent, useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { creatorApi } from '../../services/endpoints'
import { getErrorMessage } from '../../services/api'
import { Button } from '../../components/ui/Button'
import { Input, Label, Textarea } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { PageSkeleton } from '../../components/ui/Skeleton'

export default function CreatorProfilePage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['creator-profile'], queryFn: creatorApi.profile })
  const [form, setForm] = useState({
    headline: '',
    bio: '',
    skills: '',
    tools: '',
    tags: '',
    experience_years: 1,
    hourly_rate: 500,
    location: '',
  })

  useEffect(() => {
    if (!data) return
    setForm({
      headline: data.headline || '',
      bio: data.bio || '',
      skills: (data.skills || []).join(', '),
      tools: (data.tools || []).join(', '),
      tags: (data.tags || []).join(', '),
      experience_years: data.experience_years,
      hourly_rate: data.hourly_rate || 500,
      location: data.location || '',
    })
  }, [data])

  const mutation = useMutation({
    mutationFn: () =>
      creatorApi.updateProfile({
        headline: form.headline,
        bio: form.bio,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        tools: form.tools.split(',').map((s) => s.trim()).filter(Boolean),
        tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
        experience_years: Number(form.experience_years),
        hourly_rate: Number(form.hourly_rate),
        location: form.location,
      }),
    onSuccess: () => {
      toast.success('Profile updated')
      qc.invalidateQueries({ queryKey: ['creator-profile'] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  if (isLoading) return <PageSkeleton />

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    mutation.mutate()
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="page-title">Creator profile</h1>
        <p className="muted mt-1">Trust score {data?.trust_score?.toFixed(0)} · {data?.completed_projects} projects</p>
      </div>
      <Card>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>Headline</Label>
            <Input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} />
          </div>
          <div>
            <Label>Bio</Label>
            <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>
          <div>
            <Label>Skills (comma separated)</Label>
            <Input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
          </div>
          <div>
            <Label>Tools</Label>
            <Input value={form.tools} onChange={(e) => setForm({ ...form, tools: e.target.value })} />
          </div>
          <div>
            <Label>Tags</Label>
            <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label>Experience (years)</Label>
              <Input
                type="number"
                step="0.5"
                value={form.experience_years}
                onChange={(e) => setForm({ ...form, experience_years: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Hourly rate (INR)</Label>
              <Input
                type="number"
                value={form.hourly_rate}
                onChange={(e) => setForm({ ...form, hourly_rate: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
          </div>
          <Button disabled={mutation.isPending}>{mutation.isPending ? 'Saving…' : 'Save profile'}</Button>
        </form>
      </Card>
    </div>
  )
}
