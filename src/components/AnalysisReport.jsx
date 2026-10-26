import {
  Gauge, Droplets, Leaf, Sprout, Activity, CalendarCheck,
  Shovel, Bug, Wheat, Droplet, AlertTriangle, CheckCircle2, Download, Crown,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { Link } from 'react-router-dom'

// lucide-react has no Ph icon; build a tiny inline one.
function PhIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 10h2v4H8zM14 10h2v4h-2z" />
    </svg>
  )
}

const PLAN_ICONS = { shovel: Shovel, seed: Sprout, bug: Bug, droplet: Droplet, scythe: Wheat }

function MetricBar({ label, value, color, Icon }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 font-medium text-slate-600"><Icon className="h-4 w-4 text-slate-400" /> {label}</span>
        <span className="font-semibold text-slate-800">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function scoreColor(s) {
  if (s >= 75) return { ring: '#16a34a', text: 'text-brand-700', bg: 'bg-brand-50', label: 'text-brand-700' }
  if (s >= 55) return { ring: '#ca8a04', text: 'text-amber-700', bg: 'bg-amber-50', label: 'text-amber-700' }
  if (s >= 35) return { ring: '#ea580c', text: 'text-orange-700', bg: 'bg-orange-50', label: 'text-orange-700' }
  return { ring: '#dc2626', text: 'text-red-700', bg: 'bg-red-50', label: 'text-red-700' }
}

export default function AnalysisReport({ report, imageUrl }) {
  const { profile } = useAuth()
  const isFree = profile?.plan === 'free'
  const { metrics, recommended, waterNeed, amendments, plan } = report
  const c = scoreColor(metrics.fertility)
  const circ = 2 * Math.PI * 54

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Score + image */}
      <div className="card overflow-hidden">
        <div className="grid md:grid-cols-5">
          <div className="relative md:col-span-2">
            {imageUrl && <img src={imageUrl} alt="Analyzed field" className="h-64 w-full object-cover md:h-full" />}
            <span className="badge absolute left-3 top-3 bg-black/60 text-white backdrop-blur"><Activity className="h-3 w-3" /> Analyzed</span>
          </div>
          <div className="flex flex-col items-center justify-center p-8 md:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Fertility index</p>
            <div className="relative mt-4 h-40 w-40">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                <circle cx="60" cy="60" r="54" fill="none" stroke={c.ring} strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={circ} strokeDashoffset={circ - (metrics.fertility / 100) * circ}
                  style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`font-display text-5xl font-extrabold ${c.text}`}>{metrics.fertility}</span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
            </div>
            <span className={`badge mt-4 ${c.bg} ${c.label}`}><Gauge className="h-3.5 w-3.5" /> {metrics.level}</span>
            <p className="mt-3 text-center text-xs text-slate-400">Estimated pH: <b className="text-slate-600">{metrics.ph}</b> · On-device heuristic estimate</p>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="card p-6">
        <h3 className="font-display text-base font-bold text-slate-900">Soil & field metrics</h3>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <MetricBar label="Organic matter" value={metrics.organicMatter} color="bg-gradient-to-r from-amber-500 to-earth-500" Icon={Leaf} />
          <MetricBar label="Moisture level" value={metrics.moisture} color="bg-gradient-to-r from-sky-400 to-blue-600" Icon={Droplets} />
          <MetricBar label="Vegetation cover" value={metrics.vegCover} color="bg-gradient-to-r from-brand-400 to-brand-600" Icon={Sprout} />
          <MetricBar label="Crop vigor proxy" value={metrics.vigor} color="bg-gradient-to-r from-lime-400 to-emerald-600" Icon={Activity} />
          <div className="sm:col-span-2">
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 font-medium text-slate-600"><PhIcon className="h-4 w-4 text-slate-400" /> pH estimate</span>
              <span className="font-semibold text-slate-800">{metrics.ph} {metrics.ph < 6 ? '(acidic)' : metrics.ph > 7.2 ? '(alkaline)' : '(ideal)'}</span>
            </div>
            <div className="relative h-2 rounded-full bg-gradient-to-r from-red-400 via-yellow-300 to-sky-400">
              <div className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-slate-800 shadow" style={{ left: `${Math.min(100, Math.max(0, ((metrics.ph - 4) / 6) * 100))}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Crops + water */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="font-display text-base font-bold text-slate-900">Recommended crops</h3>
          <p className="mt-1 text-xs text-slate-400">Matched to your soil & Sahelian climate</p>
          <div className="mt-4 space-y-3">
            {recommended.map((crop, i) => (
              <div key={crop.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-xl shadow-sm">{crop.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{crop.name}</p>
                  <p className="text-xs text-slate-500">{crop.cycleDays}-day cycle · Water: {crop.water}</p>
                </div>
                {i === 0 && <span className="badge bg-brand-50 text-brand-700">Top pick</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="flex items-center gap-2 font-display text-base font-bold text-slate-900"><Droplets className="h-5 w-5 text-sky-500" /> Water management</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{waterNeed}</p>
          </div>
          <div className="card p-6">
            <h3 className="flex items-center gap-2 font-display text-base font-bold text-slate-900"><AlertTriangle className="h-5 w-5 text-amber-500" /> Soil amendments</h3>
            <ul className="mt-3 space-y-2">
              {amendments.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" /> {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Cultivation plan */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-display text-base font-bold text-slate-900"><CalendarCheck className="h-5 w-5 text-brand-600" /> Your cultivation plan</h3>
          {isFree && (
            <Link to="/pricing" className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:underline">
              <Crown className="h-3.5 w-3.5" /> Export PDF with Pro
            </Link>
          )}
          {!isFree && (
            <button onClick={() => window.print()} className="btn-secondary !py-1.5 !px-3 text-xs"><Download className="h-3.5 w-3.5" /> Export</button>
          )}
        </div>
        <div className="mt-6 relative">
          <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-100" />
          <div className="space-y-5">
            {plan.map((step, i) => {
              const Icon = PLAN_ICONS[step.icon] || CalendarCheck
              return (
                <div key={i} className="relative flex gap-4">
                  <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="pt-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-600">{step.week}</p>
                    <p className="mt-0.5 text-sm text-slate-700">{step.task}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <p className="rounded-xl bg-slate-100 p-3 text-center text-xs text-slate-500">
        This report is an on-device estimate from your photo. For critical decisions, confirm with a laboratory soil test.
      </p>
    </div>
  )
}
