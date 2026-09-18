import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { chatApi } from '../../services/endpoints'
import { getErrorMessage } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'

export default function MessagesPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [peerId, setPeerId] = useState('')
  const [content, setContent] = useState('')
  const peer = Number(peerId) || 0

  const { data } = useQuery({
    queryKey: ['thread', peer],
    queryFn: () => chatApi.thread(peer),
    enabled: peer > 0,
    refetchInterval: 4000,
  })

  const wsUrl = useMemo(() => {
    const token = localStorage.getItem('access_token')
    const api = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
    const base = api.replace(/^http/, 'ws').replace(/\/api\/v1$/, '')
    return token ? `${base}/api/v1/ws/chat?token=${token}` : null
  }, [])

  useEffect(() => {
    if (!wsUrl) return
    const ws = new WebSocket(wsUrl)
    ws.onmessage = () => qc.invalidateQueries({ queryKey: ['thread'] })
    return () => ws.close()
  }, [wsUrl, qc])

  const send = useMutation({
    mutationFn: () => chatApi.send({ recipient_id: peer, content }),
    onSuccess: () => {
      setContent('')
      qc.invalidateQueries({ queryKey: ['thread', peer] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!peer || !content.trim()) return
    send.mutate()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Messages</h1>
        <p className="muted mt-1">REST + WebSocket chat with notification fan-out.</p>
      </div>
      <Card className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Input
            className="max-w-xs"
            placeholder="Peer user ID"
            value={peerId}
            onChange={(e) => setPeerId(e.target.value)}
          />
        </div>
        <div className="max-h-80 space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-ink-50 p-4">
          {(data || []).map((m) => (
            <div
              key={m.id}
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                m.sender_id === user?.id ? 'ml-auto bg-accent/30' : 'bg-white/5'
              }`}
            >
              {m.content}
            </div>
          ))}
          {!data?.length ? <p className="muted">No messages in this thread.</p> : null}
        </div>
        <form onSubmit={onSubmit} className="flex gap-2">
          <Input
            placeholder="Write a message…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <Button disabled={send.isPending}>Send</Button>
        </form>
      </Card>
    </div>
  )
}
