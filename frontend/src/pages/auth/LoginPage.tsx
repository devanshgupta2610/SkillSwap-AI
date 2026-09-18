import { FormEvent, useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'
import { Input, Label } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'

export default function LoginPage() {
  const { login, user, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      navigate(user.role === 'creator' ? '/creator' : '/client', { replace: true })
    }
  }, [user, loading, navigate])

  if (!loading && user) {
    return <Navigate to={user.role === 'creator' ? '/creator' : '/client'} replace />
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      await login(email, password)
      const role = localStorage.getItem('user_role')
      navigate(role === 'creator' ? '/creator' : '/client')
    } catch {
      /* toast handled */
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-grid-fade px-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="muted mt-1">Log in to SkillSwap AI</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
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
          <Button className="w-full" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
        <p className="muted mt-4 text-center">
          New here? <Link className="text-accent-soft" to="/register">Create an account</Link>
        </p>
      </Card>
    </div>
  )
}
