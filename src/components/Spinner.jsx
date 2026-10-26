import { Loader2 } from 'lucide-react'

export default function Spinner({ fullScreen, label }) {
  const inner = (
    <div className="flex flex-col items-center gap-3 text-brand-600">
      <Loader2 className="h-8 w-8 animate-spin" />
      {label && <p className="text-sm font-medium text-slate-500">{label}</p>}
    </div>
  )
  if (fullScreen) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">{inner}</div>
    )
  }
  return inner
}
