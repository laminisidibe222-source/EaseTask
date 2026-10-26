import { useState, useCallback, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  UploadCloud, Camera, Image as ImageIcon, X, History, Trash2,
  Sprout, Crown, Zap, LogOut, LayoutDashboard, Loader2, AlertCircle, Sparkles,
} from 'lucide-react'
import Logo from '../components/Logo.jsx'
import Spinner from '../components/Spinner.jsx'
import AnalysisReport from '../components/AnalysisReport.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { analyzeLand, fileToDataUrl } from '../lib/analysis.js'
import { PLAN_LIMITS, PLANS, openCheckout } from '../lib/payment.js'
import { supabase, isConfigured } from '../lib/supabase.js'

const HISTORY_KEY = 'easetask_history'

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') } catch { return [] }
}

export default function Dashboard() {
  const { user, profile, signOut, setProfile } = useAuth()
  const navigate = useNavigate()
  const [imageUrl, setImageUrl] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [report, setReport] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [history, setHistory] = useState(loadHistory())
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const fileRef = useRef(null)

  const plan = profile?.plan || 'free'
  const limit = PLAN_LIMITS[plan]?.analysesPerMonth ?? 3
  // Usage counter stored in localStorage per month key (mirror in Supabase for production)
  const monthKey = new Date().toISOString().slice(0, 7)
  const usageKey = `easetask_usage_${monthKey}`
  const used = Number(localStorage.getItem(usageKey) || '0')
  const limitReached = used >= limit

  useEffect(() => {
    // If Supabase configured, load saved analyses for this user.
    if (!isConfigured || !user) return
    ;(async () => {
      const { data } = await supabase.from('analyses').select('*').eq('user_id', user.id).order('analyzed_at', { ascending: false }).limit(10)
      if (data?.length) setHistory(data.map(d => ({ ...d.report, id: d.id, analyzedAt: d.analyzed_at, thumbnail: d.thumbnail })))
    })()
  }, [user])

  const handleFile = useCallback(async (file) => {
    setError('')
    setNotice('')
    if (!file?.type?.startsWith('image/')) { setError('Please choose an image file (JPG, PNG, HEIC).'); return }
    if (file.size > 12 * 1024 * 1024) { setError('Image is too large. Max 12 MB.'); return }
    if (limitReached) {
      setNotice('You have reached your monthly analysis limit. Upgrade to continue.')
      return
    }
    const url = await fileToDataUrl(file)
    setImageUrl(url)
    setReport(null)
    setAnalyzing(true)
    try {
      const result = await analyzeLand(url, { fileName: file.name })
      setReport(result)
      // increment usage
      localStorage.setItem(usageKey, String(used + 1))
      // save to history
      const entry = { id: crypto.randomUUID(), ...result, thumbnail: url }
      const next = [entry, ...history].slice(0, 12)
      setHistory(next)
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
      if (isConfigured && user) {
        await supabase.from('analyses').insert({ user_id: user.id, report: result, thumbnail: url }).select()
      }
    } catch (e) {
      setError('Analysis failed. Try a clearer photo with good lighting.')
    } finally {
      setAnalyzing(false)
    }
  }, [history, limitReached, used, usageKey, user])

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  const clearImage = () => { setImageUrl(null); setReport(null); setError(''); if (fileRef.current) fileRef.current.value = '' }

  const loadHistoryItem = (h) => {
    setImageUrl(h.thumbnail)
    setReport(h)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearHistory = () => { setHistory([]); localStorage.removeItem(HISTORY_KEY) }

  const handleUpgrade = (planId) => {
    const ok = openCheckout(planId)
    if (!ok) setNotice('Checkout setup pending — add Lemon Squeezy URLs in .env (see README). No company needed.')
    else setNotice('Checkout opened in a new tab. After payment, your plan upgrades automatically.')
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Farmer'

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200/60 glass">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo to="/dashboard" size="sm" />
          <div className="flex items-center gap-2">
            <span className={`badge ${plan === 'pro' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' : 'bg-slate-100 text-slate-600'}`}>
              {plan === 'pro' ? <Crown className="h-3 w-3" /> : <Sprout className="h-3 w-3" />} {PLANS[plan]?.name || 'Free'} plan
            </span>
            {plan !== 'pro' && (
              <button onClick={() => handleUpgrade('pro')} className="btn-primary !py-1.5 !px-3 text-xs"><Crown className="h-3.5 w-3.5" /> Upgrade</button>
            )}
            <button onClick={async () => { await signOut(); navigate('/') }} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-red-600" title="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Greeting + usage */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">Hello, {displayName} 👋</h1>
            <p className="mt-1 text-sm text-slate-500">Upload a photo of your land to get a fertility report & cultivation plan.</p>
          </div>
          <div className="card flex items-center gap-3 px-4 py-3">
            <Zap className="h-5 w-5 text-brand-500" />
            <div>
              <p className="text-xs text-slate-500">Analyses this month</p>
              <p className="text-sm font-bold text-slate-800">{Math.min(used, limit)} / {limit === Infinity ? '∞' : limit}</p>
            </div>
            <div className="h-8 w-16 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full bg-gradient-to-r from-brand-400 to-brand-600" style={{ width: `${limit === Infinity ? 15 : Math.min(100, (used / limit) * 100)}%` }} />
            </div>
          </div>
        </div>

        {notice && (
          <div className="mt-5 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex-1">{notice} {limitReached && <Link to="/pricing" className="ml-2 font-semibold underline">View plans →</Link>}</div>
          </div>
        )}
        {error && (
          <div className="mt-5 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Left: upload + report */}
          <div className="space-y-6 lg:col-span-2">
            {!imageUrl && (
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => !limitReached && fileRef.current?.click()}
                className={`card flex cursor-pointer flex-col items-center justify-center border-2 border-dashed p-12 text-center transition ${dragOver ? 'border-brand-500 bg-brand-50' : 'border-slate-300 hover:border-brand-400 hover:bg-brand-50/40'} ${limitReached ? 'pointer-events-none opacity-60' : ''}`}
              >
                <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-600/30">
                  {limitReached ? <Crown className="h-7 w-7 text-white" /> : <UploadCloud className="h-7 w-7 text-white" />}
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-slate-900">
                  {limitReached ? 'Monthly limit reached' : 'Upload a photo of your field'}
                </h3>
                <p className="mt-2 max-w-sm text-sm text-slate-500">
                  {limitReached
                    ? 'Upgrade to Pro for unlimited analyses, or wait until next month.'
                    : 'Drag & drop an image here, or click to browse. Take the photo in daylight, 1–2 m above the soil.'}
                </p>
                <div className="mt-5 flex gap-2">
                  <span className="badge bg-slate-100 text-slate-600"><Camera className="h-3 w-3" /> Camera</span>
                  <span className="badge bg-slate-100 text-slate-600"><ImageIcon className="h-3 w-3" /> JPG / PNG</span>
                  <span className="badge bg-brand-50 text-brand-700"><Sparkles className="h-3 w-3" /> On-device analysis</span>
                </div>
              </div>
            )}

            {imageUrl && !report && !analyzing && (
              <div className="card overflow-hidden">
                <div className="relative">
                  <img src={imageUrl} alt="Field preview" className="h-72 w-full object-cover" />
                  <button onClick={clearImage} className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white backdrop-blur hover:bg-black/70"><X className="h-4 w-4" /></button>
                </div>
                <div className="flex items-center justify-between gap-3 p-4">
                  <p className="text-sm text-slate-600">Ready to analyze this photo?</p>
                  <div className="flex gap-2">
                    <button onClick={clearImage} className="btn-secondary !py-2 text-xs">Replace</button>
                    <button onClick={async () => {
                      setAnalyzing(true); setError('')
                      try {
                        const r = await analyzeLand(imageUrl)
                        setReport(r)
                        localStorage.setItem(usageKey, String(used + 1))
                        const entry = { id: crypto.randomUUID(), ...r, thumbnail: imageUrl }
                        const next = [entry, ...history].slice(0, 12)
                        setHistory(next); localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
                      } catch { setError('Analysis failed.') } finally { setAnalyzing(false) }
                    }} className="btn-primary !py-2 text-xs"><Sparkles className="h-3.5 w-3.5" /> Analyze now</button>
                  </div>
                </div>
              </div>
            )}

            {analyzing && (
              <div className="card flex flex-col items-center justify-center p-16">
                <Spinner label="Analyzing your land… reading soil, vegetation & moisture" />
                <div className="mt-6 w-full max-w-xs space-y-2">
                  {['Reading pixels', 'Computing vegetation index', 'Estimating organic matter & pH', 'Matching crops & building plan'].map((t, i) => (
                    <div key={t} className="flex items-center gap-2 text-xs text-slate-500" style={{ animation: `fadeIn 0.5s ${i * 0.4}s both` }}>
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> {t}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {report && !analyzing && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold text-slate-900">Analysis report</h2>
                  <button onClick={clearImage} className="btn-secondary !py-1.5 !px-3 text-xs">New analysis</button>
                </div>
                <AnalysisReport report={report} imageUrl={imageUrl} />
              </div>
            )}
          </div>

          {/* Right: history + upgrade card */}
          <aside className="space-y-6">
            {plan !== 'pro' && (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-brand-600 p-6 text-white shadow-lg">
                <Crown className="absolute -right-4 -top-4 h-24 w-24 opacity-20" />
                <h3 className="font-display text-lg font-bold">Unlock Pro</h3>
                <p className="mt-1 text-sm text-white/90">Unlimited analyses, PDF export, and full rotation plans.</p>
                <button onClick={() => handleUpgrade('pro')} className="mt-4 w-full rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-orange-600 shadow transition hover:bg-orange-50">
                  Upgrade — $12.99/mo
                </button>
              </div>
            )}

            <div className="card p-5">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-display text-base font-bold text-slate-900"><History className="h-4 w-4 text-slate-400" /> Recent analyses</h3>
                {history.length > 0 && (
                  <button onClick={clearHistory} className="text-xs text-slate-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                )}
              </div>
              {history.length === 0 ? (
                <p className="mt-4 rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-400">No analyses yet. Your reports will appear here.</p>
              ) : (
                <div className="mt-4 space-y-2.5">
                  {history.slice(0, 6).map(h => (
                    <button key={h.id} onClick={() => loadHistoryItem(h)} className="flex w-full items-center gap-3 rounded-xl border border-slate-100 p-2 text-left transition hover:border-brand-300 hover:bg-brand-50/40">
                      {h.thumbnail ? <img src={h.thumbnail} alt="" className="h-12 w-12 rounded-lg object-cover" /> : <div className="h-12 w-12 rounded-lg bg-slate-100" />}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">Fertility: {h.metrics?.fertility}/100</p>
                        <p className="truncate text-xs text-slate-400">{new Date(h.analyzedAt).toLocaleString()}</p>
                      </div>
                      <span className={`badge h-fit ${h.metrics?.fertility >= 55 ? 'bg-brand-50 text-brand-700' : 'bg-amber-50 text-amber-700'}`}>{h.metrics?.fertility >= 55 ? 'Good' : 'Low'}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-5">
              <h3 className="flex items-center gap-2 font-display text-base font-bold text-slate-900"><LayoutDashboard className="h-4 w-4 text-slate-400" /> Quick tips</h3>
              <ul className="mt-3 space-y-2 text-xs text-slate-500">
                <li className="flex gap-2"><span className="text-brand-500">•</span> Take photos in daylight, avoiding shadows.</li>
                <li className="flex gap-2"><span className="text-brand-500">•</span> Capture bare soil AND any existing vegetation.</li>
                <li className="flex gap-2"><span className="text-brand-500">•</span> For best results, analyze 2–3 spots per field and average.</li>
                <li className="flex gap-2"><span className="text-brand-500">•</span> Results are estimates — confirm with a lab test before large investment.</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
