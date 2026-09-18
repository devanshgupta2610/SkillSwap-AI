import { Link, NavLink, Outlet } from 'react-router-dom'
import { Bell, LogOut, Menu, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../lib/utils'

const creatorLinks = [
  { to: '/creator', label: 'Dashboard', end: true },
  { to: '/creator/profile', label: 'Profile' },
  { to: '/creator/portfolio', label: 'Portfolio' },
  { to: '/creator/ai-builder', label: 'AI Builder' },
  { to: '/creator/gigs', label: 'Gigs' },
  { to: '/creator/bookings', label: 'Bookings' },
  { to: '/creator/messages', label: 'Messages' },
  { to: '/creator/earnings', label: 'Earnings' },
  { to: '/creator/analytics', label: 'Analytics' },
]

const clientLinks = [
  { to: '/client', label: 'Dashboard', end: true },
  { to: '/client/post-job', label: 'Post Job' },
  { to: '/client/creators', label: 'Browse Creators' },
  { to: '/client/bookings', label: 'Bookings' },
  { to: '/client/messages', label: 'Messages' },
  { to: '/client/reviews', label: 'Reviews' },
]

export function DashboardLayout({ variant }: { variant: 'creator' | 'client' }) {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const links = variant === 'creator' ? creatorLinks : clientLinks

  return (
    <div className="min-h-screen bg-grid-fade">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-0 md:gap-6 md:px-6 md:py-6">
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 w-72 transform border-r border-white/10 bg-ink/95 p-5 backdrop-blur-xl transition md:static md:translate-x-0 md:rounded-3xl md:border md:bg-ink-100/60',
            open ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="mb-8 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <Sparkles className="h-5 w-5 text-accent" />
              SkillSwap AI
            </Link>
            <button className="md:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'block rounded-xl px-3 py-2.5 text-sm transition',
                    isActive ? 'bg-accent/20 text-accent-soft' : 'text-white/65 hover:bg-white/5 hover:text-white',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink
              to="/notifications"
              className="mt-4 block rounded-xl px-3 py-2.5 text-sm text-white/65 hover:bg-white/5"
            >
              Notifications
            </NavLink>
            <NavLink
              to="/settings"
              className="block rounded-xl px-3 py-2.5 text-sm text-white/65 hover:bg-white/5"
            >
              Settings
            </NavLink>
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/5 bg-ink/80 px-4 py-3 backdrop-blur md:rounded-3xl md:border md:bg-ink-100/50 md:px-6">
            <button className="md:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-sm text-white/50">Signed in as</p>
              <p className="font-medium">{user?.full_name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/notifications" className="btn-ghost px-3 py-2">
                <Bell className="h-4 w-4" />
              </Link>
              <button onClick={logout} className="btn-ghost px-3 py-2">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
