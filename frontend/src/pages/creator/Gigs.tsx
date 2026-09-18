import { FormEvent, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { gigApi, sharedApi } from '../../services/endpoints'
import { getErrorMessage } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'
import { Input, Label, Textarea } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { PageSkeleton } from '../../components/ui/Skeleton'
import { formatCurrency } from '../../lib/utils'

export default function CreatorGigsPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['my-gigs', user?.id],
    queryFn: () => gigApi.list({ creator_id: user?.id }),
    enabled: !!user,
  })
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'design',
    tags: '',
    price: 1500,
    delivery_days: 7,
  })

  const create = useMutation({
    mutationFn: () =>
      gigApi.create({
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        price: Number(form.price),
        delivery_days: Number(form.delivery_days),
      }),
    onSuccess: () => {
      toast.success('Gig published')
      qc.invalidateQueries({ queryKey: ['my-gigs'] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const remove = useMutation({
    mutationFn: (id: number) => gigApi.remove(id),
    onSuccess: () => {
      toast.success('Gig deleted')
      qc.invalidateQueries({ queryKey: ['my-gigs'] })
    },
  })

  async function suggestPrice() {
    try {
      const res = await sharedApi.pricing({
        category: form.category,
        skills: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        experience_years: 2,
        delivery_days: form.delivery_days,
      })
      setForm((f) => ({ ...f, price: Math.round(res.suggested_price) }))
      toast.success(res.rationale)
    } catch (e) {
      toast.error(getErrorMessage(e))
    }
  }

  if (isLoading) return <PageSkeleton />

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    create.mutate()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Gig management</h1>
        <p className="muted mt-1">Create, price, and manage marketplace offerings.</p>
      </div>
      <Card>
        <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label>Title</Label>
            <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Label>Description</Label>
            <Textarea
              required
              minLength={20}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <Label>Category</Label>
            <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
          <div>
            <Label>Tags</Label>
            <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </div>
          <div>
            <Label>Price (INR)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              />
              <Button type="button" variant="ghost" onClick={suggestPrice}>
                AI price
              </Button>
            </div>
          </div>
          <div>
            <Label>Delivery days</Label>
            <Input
              type="number"
              value={form.delivery_days}
              onChange={(e) => setForm({ ...form, delivery_days: Number(e.target.value) })}
            />
          </div>
          <div className="md:col-span-2">
            <Button disabled={create.isPending}>Publish gig</Button>
          </div>
        </form>
      </Card>
      <div className="grid gap-4">
        {(data || []).map((g) => (
          <Card key={g.id} className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold">{g.title}</h3>
              <p className="muted mt-1">
                {formatCurrency(g.price)} · {g.delivery_days}d · {g.views} views
              </p>
            </div>
            <Button variant="ghost" onClick={() => remove.mutate(g.id)}>
              Delete
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
