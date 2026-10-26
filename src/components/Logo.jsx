import { Link } from 'react-router-dom'
import { Sprout } from 'lucide-react'

/** EaseTask wordmark — leaf icon + wordmark. */
export default function Logo({ to = '/', size = 'md', light = false }) {
  const dims = size === 'lg' ? 'h-9 w-9' : size === 'sm' ? 'h-6 w-6' : 'h-8 w-8'
  const text = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-xl'
  return (
    <Link to={to} className="group inline-flex items-center gap-2.5">
      <span className={`relative flex ${dims} items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-600/30 transition group-hover:scale-105`}>
        <Sprout className={`${size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} text-white`} strokeWidth={2.5} />
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-earth-400 ring-2 ring-white" />
      </span>
      <span className={`font-display font-extrabold tracking-tight ${text} ${light ? 'text-white' : 'text-slate-900'}`}>
        Ease<span className="text-brand-600">Task</span>
      </span>
    </Link>
  )
}
