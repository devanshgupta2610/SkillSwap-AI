import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'
import { Input, Label } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'
import type { UserRole } from '../../types'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('creator')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      await register({ email, password, full_name: fullName, role })
      navigate(role === 'creator' ? '/creator' : '/client')
    } catch {
      /* toast handled */
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-grid-fade px-4 py-10">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold">Join SkillSwap AI</h1>
        <p className="muted mt-1">Create your creator or client workspace</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <Label>I am a</Label>
            <div className="grid grid-cols-2 gap-2">
              {(['creator', 'client'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`rounded-xl border px-3 py-2.5 text-sm capitalize ${
                    role === r ? 'border-accent bg-accent/20 text-accent-soft' : 'border-white/10 bg-white/5'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <Button className="w-full" disabled={busy}>
            {busy ? 'Creating…' : 'Create account'}
          </Button>
        </form>
        <p className="muted mt-4 text-center">
          Already have an account? <Link className="text-accent-soft" to="/login">Log in</Link>
        </p>
      </Card>
    </div>
  )
}
