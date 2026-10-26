import { Link } from 'react-router-dom'
import {
  Camera, Sprout, BarChart3, CalendarCheck, CloudUpload, ShieldCheck,
  ArrowRight, Leaf, Droplets, Sun, CheckCircle2, Globe2,
} from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'

const features = [
  { icon: Camera, title: 'Photo-to-insight', desc: 'Snap a photo of your field. EaseTask analyzes vegetation, soil color, and texture right from the image.', color: 'from-emerald-500 to-green-600' },
  { icon: BarChart3, title: 'Fertility score', desc: 'Get an instant 0–100 fertility index with organic matter, moisture, pH and vegetation-cover estimates.', color: 'from-lime-500 to-emerald-600' },
  { icon: Sprout, title: 'Crop recommendations', desc: 'Best crops for your soil and the West-African / Sahelian climate — millet, sorghum, groundnut, cowpea and more.', color: 'from-amber-500 to-orange-600' },
  { icon: CalendarCheck, title: 'Cultivation plan', desc: 'A week-by-week schedule: land prep, sowing, weeding, fertilizing, irrigation, and harvest timing.', color: 'from-sky-500 to-blue-600' },
  { icon: CloudUpload, title: 'History in the cloud', desc: 'Every analysis is saved to your account. Track your land\'s health season after season.', color: 'from-violet-500 to-purple-600' },
  { icon: ShieldCheck, title: 'Private & secure', desc: 'Your data is yours. Powered by Supabase with row-level security — only you see your fields.', color: 'from-teal-500 to-cyan-600' },
]

const steps = [
  { n: '01', title: 'Create your free account', desc: 'Sign up in seconds — no credit card required.' },
  { n: '02', title: 'Upload a field photo', desc: 'Take or upload a clear picture of your land.' },
  { n: '03', title: 'Read your report', desc: 'Fertility score, crop matches, and a full cultivation plan.' },
  { n: '04', title: 'Grow with confidence', desc: 'Follow the plan, track progress, upgrade anytime.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-br from-brand-200/60 via-lime-100/40 to-transparent blur-3xl" />
          <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-amber-100/50 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="badge bg-brand-50 text-brand-700 ring-1 ring-brand-200">
              <Leaf className="h-3.5 w-3.5" /> AI-powered agronomy for every farmer
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-6xl">
              Know your land.
              <br />
              <span className="text-gradient">Grow better harvests.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-slate-600">
              Upload one photo of your field and EaseTask tells you how fertile it is, which crops to plant, and gives you a step-by-step cultivation plan — built for the Sahelian climate.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/signup" className="btn-primary !px-7 !py-3 !text-base">
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/pricing" className="btn-secondary !px-7 !py-3 !text-base">See pricing</Link>
            </div>
            <p className="mt-4 text-xs text-slate-400">Free plan includes 3 analyses per month · No credit card</p>
          </div>

          {/* Hero visual — mock report card */}
          <div className="mx-auto mt-14 max-w-4xl animate-slide-up">
            <div className="card overflow-hidden shadow-2xl shadow-brand-900/10">
              <div className="grid md:grid-cols-2">
                <div className="relative bg-gradient-to-br from-brand-700 via-brand-600 to-lime-600 p-8 text-white">
                  <div className="flex items-center gap-2 text-sm opacity-90"><Camera className="h-4 w-4" /> Field photo analysis</div>
                  <div className="mt-8 flex items-end gap-2">
                    <span className="font-display text-7xl font-extrabold">78</span>
                    <span className="mb-3 text-lg opacity-80">/ 100</span>
                  </div>
                  <p className="mt-1 text-lg font-semibold">Moderately fertile soil</p>
                  <div className="mt-6 space-y-3 text-sm">
                    {[['Organic matter', 62, Droplets], ['Moisture', 48, Droplets], ['Vegetation cover', 55, Sprout]].map(([label, v, Icon]) => (
                      <div key={label}>
                        <div className="mb-1 flex justify-between"><span className="opacity-80">{label}</span><span className="font-semibold">{v}%</span></div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-white" style={{ width: `${v}%` }} /></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-8">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Recommended crops</p>
                  <div className="mt-4 space-y-3">
                    {[['Groundnut (Arachide)', '120-day cycle', '🥜'], ['Pearl Millet (Milon)', 'Drought-tolerant', '🌾'], ['Cowpea (Niébé)', 'Fixes nitrogen', '🫘']].map(([n, d, e]) => (
                      <div key={n} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                        <span className="text-2xl">{e}</span>
                        <div className="flex-1"><p className="text-sm font-semibold text-slate-800">{n}</p><p className="text-xs text-slate-500">{d}</p></div>
                        <CheckCircle2 className="h-5 w-5 text-brand-500" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 rounded-xl bg-brand-50 p-4">
                    <p className="flex items-center gap-2 text-sm font-semibold text-brand-800"><CalendarCheck className="h-4 w-4" /> Cultivation plan ready</p>
                    <p className="mt-1 text-xs text-brand-700/80">5-stage schedule from land prep to harvest.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">Everything you need to farm smarter</h2>
          <p className="mt-4 text-slate-600">From a single photo to a full growing season — EaseTask does the agronomy so you can focus on the harvest.</p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(f => (
            <div key={f.title} className="card group p-6 transition hover:-translate-y-1 hover:shadow-lg">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} shadow-lg`}>
                <f.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">From photo to harvest in 4 steps</h2>
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(s => (
              <div key={s.n} className="relative">
                <span className="font-display text-5xl font-extrabold text-brand-100">{s.n}</span>
                <h3 className="mt-2 font-display text-lg font-bold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Climate strip */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="card overflow-hidden bg-gradient-to-r from-brand-700 to-lime-600 p-10 text-white">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2"><Globe2 className="h-5 w-5" /><span className="text-sm font-semibold uppercase tracking-wider opacity-90">Built for West Africa</span></div>
              <h3 className="mt-3 font-display text-2xl font-bold">Tuned to the Sahelian climate & local crops</h3>
              <p className="mt-2 max-w-xl text-sm text-white/80">Recommendations account for short rainy seasons, high temperatures, and the crops that thrive in Senegal and the region.</p>
            </div>
            <div className="flex gap-6">
              {[[Sun, '28–38°C'], [Droplets, 'Jun–Oct rains'], [Sprout, 'Local seeds']].map(([Icon, t]) => (
                <div key={t} className="text-center"><Icon className="mx-auto h-7 w-7" /><p className="mt-1 text-xs font-medium opacity-90">{t}</p></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 pb-24 text-center sm:px-6">
        <h2 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">Your first analysis is free</h2>
        <p className="mt-4 text-slate-600">Join thousands of farmers growing with data, not guesswork.</p>
        <Link to="/signup" className="btn-primary mt-8 !px-8 !py-3 !text-base">Create free account <ArrowRight className="h-4 w-4" /></Link>
      </section>

      <Footer />
    </div>
  )
}
