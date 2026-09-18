import { FormEvent, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { bookingApi, clientApi, reviewApi } from '../../services/endpoints'
import { getErrorMessage } from '../../services/api'
import { Button } from '../../components/ui/Button'
import { Input, Label } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { PageSkeleton } from '../../components/ui/Skeleton'

export default function CreatorPublicProfilePage() {
  const { id } = useParams()
  const creatorId = Number(id)
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({
    queryKey: ['creator-public', creatorId],
    queryFn: () => clientApi.creatorProfile(creatorId),
    enabled: !!creatorId,
  })
  const reviews = useQuery({
    queryKey: ['reviews', creatorId],
    queryFn: () => reviewApi.forCreator(creatorId),
    enabled: !!creatorId,
  })
  const [amount, setAmount] = useState(5000)
  const [title, setTitle] = useState('Project booking')

  const book = useMutation({
    mutationFn: () =>
      bookingApi.create({
        creator_id: creatorId,
        title,
        description: 'Booked from creator profile',
        amount: Number(amount),
        milestones: [
          { title: 'Kickoff', amount: Number(amount) * 0.3, order_index: 0 },
          { title: 'Delivery', amount: Number(amount) * 0.7, order_index: 1 },
        ],
      }),
    onSuccess: () => {
      toast.success('Booking requested')
      navigate('/client/bookings')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const save = useMutation({
    mutationFn: () => clientApi.saveCreator(creatorId),
    onSuccess: () => toast.success('Creator saved'),
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  if (isLoading || !data) return <PageSkeleton />

  function onBook(e: FormEvent) {
    e.preventDefault()
    book.mutate()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="page-title">{data.user.full_name}</h1>
          <p className="muted mt-1">{data.profile.headline}</p>
          <p className="mt-2 text-sm text-white/60">
            ★ {data.profile.rating_avg} ({data.profile.rating_count}) · Trust {data.profile.trust_score}
          </p>
        </div>
        <Button variant="ghost" onClick={() => save.mutate()}>
          Save creator
        </Button>
      </div>
      <Card>
        <p className="text-sm text-white/70">{data.profile.bio || 'No bio yet.'}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(data.profile.skills || []).map((s: string) => (
            <span key={s} className="rounded-lg bg-accent/15 px-2 py-1 text-xs text-accent-soft">
              {s}
            </span>
          ))}
        </div>
      </Card>
      <div>
        <h2 className="text-lg font-semibold">Portfolio</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {(data.portfolio || []).map((p: { id: number; title: string; description: string }) => (
            <Card key={p.id}>
              <h3 className="font-medium">{p.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-white/60">{p.description}</p>
            </Card>
          ))}
        </div>
      </div>
      <Card>
        <h2 className="font-semibold">Book this creator</h2>
        <form onSubmit={onBook} className="mt-4 grid gap-3 md:grid-cols-2">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <Label>Amount (INR)</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          </div>
          <div className="md:col-span-2">
            <Button disabled={book.isPending}>Request booking</Button>
          </div>
        </form>
      </Card>
      <div>
        <h2 className="text-lg font-semibold">Verified reviews</h2>
        <div className="mt-3 space-y-3">
          {(reviews.data || []).map((r) => (
            <Card key={r.id}>
              <p className="font-medium">★ {r.rating}</p>
              <p className="mt-1 text-sm text-white/65">{r.feedback}</p>
            </Card>
          ))}
          {!reviews.data?.length ? <p className="muted">No reviews yet.</p> : null}
        </div>
      </div>
    </div>
  )
}
