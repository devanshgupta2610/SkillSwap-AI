import { FormEvent, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { bookingApi, reviewApi } from '../../services/endpoints'
import { getErrorMessage } from '../../services/api'
import { Button } from '../../components/ui/Button'
import { Input, Label, Textarea } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import { PageSkeleton } from '../../components/ui/Skeleton'

export default function ClientReviewsPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['bookings'], queryFn: bookingApi.list })
  const [bookingId, setBookingId] = useState('')
  const [rating, setRating] = useState(5)
  const [feedback, setFeedback] = useState('')

  const completed = (data || []).filter((b) => b.status === 'completed')

  const create = useMutation({
    mutationFn: () =>
      reviewApi.create({
        booking_id: Number(bookingId),
        rating: Number(rating),
        feedback,
      }),
    onSuccess: () => {
      toast.success('Verified review submitted')
      qc.invalidateQueries({ queryKey: ['bookings'] })
      setFeedback('')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  if (isLoading) return <PageSkeleton />

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    create.mutate()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="page-title">Reviews</h1>
        <p className="muted mt-1">Only completed bookings unlock verified reviews.</p>
      </div>
      <Card>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>Completed booking</Label>
            <select
              className="input-field"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              required
            >
              <option value="">Select booking</option>
              {completed.map((b) => (
                <option key={b.id} value={b.id}>
                  #{b.id} — {b.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Rating</Label>
            <Input
              type="number"
              min={1}
              max={5}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Feedback</Label>
            <Textarea required minLength={10} value={feedback} onChange={(e) => setFeedback(e.target.value)} />
          </div>
          <Button disabled={create.isPending || !completed.length}>Submit review</Button>
        </form>
      </Card>
    </div>
  )
}
