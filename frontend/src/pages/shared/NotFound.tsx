import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-grid-fade px-4 text-center">
      <p className="text-sm uppercase tracking-[0.2em] text-accent-soft">404</p>
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="muted max-w-md">The route you requested does not exist in SkillSwap AI.</p>
      <Link to="/">
        <Button>Back home</Button>
      </Link>
    </div>
  )
}
