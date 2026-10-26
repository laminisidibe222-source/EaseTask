import { Link } from 'react-router-dom'
import { Sprout, ShieldCheck, Zap, Leaf } from 'lucide-react'
import Logo from '../components/Logo.jsx'

/** Shared split-screen layout for Login / Signup. */
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen">
      {/* Left — form */}
      <div className="flex w-full flex-col px-6 py-8 sm:px-12 lg:w-1/2">
        <Logo />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-6 text-center text-sm text-slate-500">{footer}</p>
        </div>
        <p className="text-center text-xs text-slate-400">
          Protected by Supabase Auth · <Link to="/" className="hover:text-brand-600">← Back to home</Link>
        </p>
      </div>

      {/* Right — visual panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-lime-600 lg:block lg:w-1/2">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex h-full flex-col justify-center p-12 text-white">
          <div className="animate-float">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <Sprout className="h-8 w-8" />
            </div>
          </div>
          <h2 className="mt-8 font-display text-4xl font-extrabold leading-tight">
            One photo.<br />A complete farming plan.
          </h2>
          <p className="mt-4 max-w-md text-white/80">
            EaseTask analyzes your land from a picture and tells you how fertile it is, what to plant, and exactly when to do it.
          </p>
          <div className="mt-10 space-y-4">
            {[
              [Zap, 'Instant fertility score in seconds'],
              [Leaf, 'Crop picks for the Sahelian climate'],
              [ShieldCheck, 'Your data stays private & secure'],
            ].map(([Icon, t]) => (
              <div key={t} className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15"><Icon className="h-4 w-4" /></span>
                <span className="text-sm font-medium">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
