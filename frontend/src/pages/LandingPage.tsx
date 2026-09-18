import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Bot, ShieldCheck, Sparkles, Workflow } from 'lucide-react'
import { MarketingNav } from '../components/layout/MarketingNav'
import { Button } from '../components/ui/Button'

const features = [
  {
    icon: Sparkles,
    title: 'AI Portfolio Builder',
    body: 'Upload projects and generate client-ready portfolio cards in seconds — not years of résumé padding.',
  },
  {
    icon: Bot,
    title: 'Trust-weighted matching',
    body: 'Jobs match on skills, portfolio evidence, and trust — never lowest-price race-to-the-bottom ranking.',
  },
  {
    icon: Workflow,
    title: 'Milestone bookings',
    body: 'Pending → Completed with milestones so creators stay protected through every delivery stage.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified reviews',
    body: 'Only completed projects unlock reviews, keeping reputation honest for students and clients.',
  },
]

const steps = [
  { n: '01', title: 'Create your identity', body: 'Join as creator or client with a secure JWT account.' },
  { n: '02', title: 'Build with AI', body: 'Generate a portfolio that shows proof of skill, not just claims.' },
  { n: '03', title: 'Match & deliver', body: 'Get matched, book with milestones, chat in real time, earn trust.' },
]

const faqs = [
  {
    q: 'Is SkillSwap AI another Fiverr?',
    a: 'No. We optimize for student creators with AI portfolios and trust-weighted matching, not gig spam.',
  },
  {
    q: 'Do I need an OpenAI key?',
    a: 'For production AI generation yes. Locally the backend falls back to structured heuristics if AI is disabled.',
  },
  {
    q: 'How are payments handled?',
    a: 'This SIH build models milestone bookings and earnings analytics. Payment gateway hooks can be added later.',
  },
]

export default function LandingPage() {
  return (
    <div className="bg-ink text-white">
      <MarketingNav />
      <section className="relative overflow-hidden bg-grid-fade pt-28 md:pt-36">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(79,127,255,0.22),transparent_40%)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-24 md:grid-cols-2 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-accent-soft">
              Smart India Hackathon · Track 2
            </p>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
              SkillSwap <span className="text-accent">AI</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/65">
              The AI marketplace where students and young creators showcase proof of skill, get matched
              intelligently, and deliver work securely.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register">
                <Button>
                  Start creating <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button variant="ghost">Explore product</Button>
              </a>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="glass relative min-h-[340px] overflow-hidden p-6"
          >
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/30 blur-3xl" />
            <p className="text-sm text-accent-soft">Live match preview</p>
            <h3 className="mt-2 text-2xl font-semibold">UI Designer · 94% fit</h3>
            <p className="mt-3 text-sm text-white/55">
              Skills overlap · Portfolio evidence · Trust score 88 · Verified reviews
            </p>
            <div className="mt-8 space-y-3">
              {['Figma systems', 'SIH case study', 'Milestone-ready'].map((item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <h2 className="page-title">Built for creators, not commodity freelancing</h2>
        <p className="muted mt-3 max-w-2xl">
          Premium SaaS experience with glassmorphism, dark surfaces, and workflows that protect young talent.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass p-6"
            >
              <f.icon className="h-6 w-6 text-accent" />
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-white/60">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="how" className="border-y border-white/5 bg-ink-50/40 py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="page-title">How it works</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="glass p-6">
                <p className="text-accent font-mono text-sm">{s.n}</p>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-white/60">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <h2 className="page-title">What early users say</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            'Finally a marketplace that values my college projects.',
            'AI portfolio took 2 minutes and looked client-ready.',
            'Matching felt fair — not whoever undercuts the price.',
          ].map((quote) => (
            <blockquote key={quote} className="glass p-6 text-sm text-white/70">
              “{quote}”
              <footer className="mt-4 text-xs text-white/40">Student creator · SIH pilot</footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-6xl px-4 pb-20 md:px-6">
        <h2 className="page-title">FAQ</h2>
        <div className="mt-8 space-y-4">
          {faqs.map((f) => (
            <details key={f.q} className="glass group p-5">
              <summary className="cursor-pointer list-none font-medium">{f.q}</summary>
              <p className="mt-3 text-sm text-white/60">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 md:px-6">
        <div className="glass flex flex-col items-start justify-between gap-6 bg-gradient-to-br from-accent/20 to-transparent p-8 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold">Ready to swap skills the smart way?</h2>
            <p className="muted mt-2">Join SkillSwap AI and ship your first AI portfolio today.</p>
          </div>
          <Link to="/register">
            <Button>
              Create free account <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
