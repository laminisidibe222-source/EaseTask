import { useState, useCallback, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  UploadCloud, Camera, Image as ImageIcon, X, History, Trash2,
  Sprout, Crown, Zap, LogOut, LayoutDashboard, AlertCircle, Sparkles, Globe, Check, CreditCard
} from 'lucide-react'
import Logo from '../components/Logo.jsx'
import Spinner from '../components/Spinner.jsx'
import AnalysisReport from '../components/AnalysisReport.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { analyzeLand, fileToDataUrl } from '../lib/analysis.js'
import { PLAN_LIMITS, openCheckout } from '../lib/payment.js'
import { supabase, isConfigured } from '../lib/supabase.js'

const HISTORY_KEY = 'easetask_history'

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') } catch { return [] }
}

export default function Dashboard() {
  const { user, profile, signOut } = useAuth()
  const { t, lang, setLang } = useLanguage()
  const navigate = useNavigate()

  const [imageUrl, setImageUrl] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [report, setReport] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [history, setHistory] = useState(loadHistory())
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  
  const [showPricing, setShowPricing] = useState(false)

  const fileRef = useRef(null)
  const plan = profile?.plan || 'free'
  const limit = PLAN_LIMITS[plan]?.analysesPerMonth ?? 3

  const monthKey = new Date().toISOString().slice(0, 7)
  const usageKey = `easetask_usage_${monthKey}`
  
  const [used, setUsed] = useState(() => Number(localStorage.getItem(usageKey) || '0'))
  const limitReached = used >= limit

  useEffect(() => {
    if (!isConfigured || !user) return
    ;(async () => {
      const { data } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('analyzed_at', { ascending: false })
        .limit(10)
      if (data?.length) {
        setHistory(prev => {
          const merged = [...data.map(d => ({
            ...d.report,
            id: d.id,
            analyzedAt: d.analyzed_at
          })), ...prev]
          const unique = Array.from(new Map(merged.map(item => [item.id, item])).values())
          return unique.slice(0, 12)
        })
      }
    })()
  }, [user])

  const handleFile = useCallback(async (file) => {
    setError('')
    setNotice('')

    if (!file?.type?.startsWith('image/')) {
      setError(lang === 'fr' ? 'Veuillez choisir un fichier image.' : 'Please choose an image file.')
      return
    }
    if (file.size > 12 * 1024 * 1024) {
      setError(lang === 'fr' ? 'L\'image est trop volumineuse. Max 12 Mo.' : 'Image is too large. Max 12 MB.')
      return
    }
    if (limitReached) {
      setShowPricing(true)
      return
    }

    setAnalyzing(true)
    setReport(null)

    try {
      const url = await fileToDataUrl(file)
      setImageUrl(url)

      const result = await analyzeLand(url, { fileName: file.name })
      setReport(result)

      const nextUsed = used + 1
      localStorage.setItem(usageKey, String(nextUsed))
      setUsed(nextUsed)

      const entry = { 
        ...result, 
        id: result.id || crypto.randomUUID(), 
        analyzedAt: new Date().toISOString()
      }
      
      setHistory(prev => {
        const next = [entry, ...prev].slice(0, 12)
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
        return next
      })

      if (isConfigured && user) {
        await supabase.from('analyses').insert({
          user_id: user.id,
          report: result
        }).select()
      }
    } catch (e) {
      console.error(e)
      setError(lang === 'fr' ? 'L\'analyse a échoué.' : 'Analysis failed.')
    } finally {
      setAnalyzing(false)
    }
  }, [limitReached, used, usageKey, user, lang])

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  const clearImage = () => {
    setImageUrl(null)
    setReport(null)
    setError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const loadHistoryItem = (h) => {
    setImageUrl(null)
    setReport(h)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // --- UPDATED CLEAR HISTORY ---
  const clearHistory = async () => {
    setHistory([])
    localStorage.removeItem(HISTORY_KEY)
    
    if (isConfigured && user) {
      await supabase
        .from('analyses')
        .delete()
        .eq('user_id', user.id)
    }
  }

    const handleUpgrade = (planId) => {
    const ok = openCheckout(planId)
    
    if (!ok) {
      setNotice(lang === 'fr' 
        ? 'Configuration du paiement en attente. Ajoutez vos liens Wave dans payment.js.' 
        : 'Checkout pending. Add your Wave links in payment.js.')
      setShowPricing(false)
    } else {
      // Show instructions to the user
      setNotice(lang === 'fr' 
        ? 'Lien de paiement Wave ouvert dans un nouvel onglet. Après avoir payé, envoyez votre reçu à support@easetask.com avec votre adresse email pour activer votre compte.' 
        : 'Wave payment link opened in a new tab. After paying, send your receipt to support@easetask.com with your email address to activate your account.')
      setShowPricing(false)
    }
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Farmer'

  const trans = {
    hello: lang === 'fr' ? 'Bonjour' : 'Hello',
    welcome: lang === 'fr' ? 'Téléchargez une photo de votre terre.' : 'Upload a photo of your land to get a report.',
    analysesThisMonth: lang === 'fr' ? 'Analyses ce mois' : 'Analyses this month',
    uploadTitle: lang === 'fr' ? 'Télécharger une photo' : 'Upload a photo',
    uploadDesc: lang === 'fr' ? 'Glissez-déposez une image ici.' : 'Drag & drop an image here.',
    limitReachedTitle: lang === 'fr' ? 'Limite mensuelle atteinte' : 'Monthly limit reached',
    limitReachedDesc: lang === 'fr' ? 'Cliquez ici pour passer à la version Pro.' : 'Click here to upgrade to Pro.',
    camera: lang === 'fr' ? 'Appareil photo' : 'Camera',
    onDevice: lang === 'fr' ? 'Analyse locale' : 'On-device analysis',
    readyToAnalyze: lang === 'fr' ? 'Prêt à analyser ?' : 'Ready to analyze?',
    replace: lang === 'fr' ? 'Remplacer' : 'Replace',
    analyzeNow: lang === 'fr' ? 'Analyser' : 'Analyze now',
    analyzing: lang === 'fr' ? 'Analyse en cours…' : 'Analyzing…',
    analysisReport: lang === 'fr' ? 'Rapport d\'analyse' : 'Analysis report',
    newAnalysis: lang === 'fr' ? 'Nouvelle analyse' : 'New analysis',
    recentAnalyses: lang === 'fr' ? 'Analyses récentes' : 'Recent analyses',
    noAnalyses: lang === 'fr' ? 'Aucune analyse.' : 'No analyses yet.',
    signOut: lang === 'fr' ? 'Se déconnecter' : 'Sign out',
    freePlan: lang === 'fr' ? 'Gratuit' : 'Free plan',
    proPlan: 'Pro'
  }

  return (
    <div className="min-h-screen bg-slate-50 relative">
      <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo to="/dashboard" size="sm" />
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')} className="flex items-center gap-1.5 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full hover:bg-green-50 transition-colors">
              <Globe size={14} /> {lang === 'fr' ? 'Français' : 'English'}
            </button>
            <span className={`badge ${plan === 'pro' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
              {plan === 'pro' ? <Crown className="h-3 w-3" /> : <Sprout className="h-3 w-3" />}
              {plan === 'pro' ? trans.proPlan : trans.freePlan}
            </span>
            {plan !== 'pro' && (
              <button onClick={() => setShowPricing(true)} className="btn-primary !py-1.5 !px-3 text-xs">
                <Crown className="h-3.5 w-3.5" /> Upgrade
              </button>
            )}
            <button onClick={async () => { await signOut(); navigate('/') }} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-red-600">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">
              {trans.hello}, {displayName} 👋
            </h1>
            <p className="mt-1 text-sm text-slate-500">{trans.welcome}</p>
          </div>
          <div className="card flex items-center gap-3 px-4 py-3 border border-slate-200 shadow-sm rounded-xl bg-white">
            <Zap className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-xs text-slate-500">{trans.analysesThisMonth}</p>
              <p className="text-sm font-bold text-slate-800">
                {Math.min(used, limit)} / {limit === Infinity ? '∞' : limit}
              </p>
            </div>
            <div className="h-8 w-16 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full bg-green-500" style={{ width: `${limit === Infinity ? 15 : Math.min(100, (used / limit) * 100)}%` }} />
            </div>
          </div>
        </div>

        {notice && (
          <div className="mt-5 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex-1">{notice}</div>
          </div>
        )}

        {error && (
          <div className="mt-5 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {!imageUrl && !report && !analyzing && (
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => limitReached ? setShowPricing(true) : fileRef.current?.click()}
                className={`card flex cursor-pointer flex-col items-center justify-center border-2 border-dashed p-12 text-center transition rounded-2xl bg-white ${
                  dragOver ? 'border-green-500 bg-green-50' : 'border-slate-300 hover:border-green-400 hover:bg-slate-50'
                } ${limitReached ? 'opacity-90 hover:opacity-100 hover:border-amber-400' : ''}`}
              >
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg ${limitReached ? 'bg-amber-400 shadow-amber-500/30' : 'bg-green-500 shadow-green-600/30'}`}>
                  {limitReached ? <Crown className="h-7 w-7 text-white" /> : <UploadCloud className="h-7 w-7 text-white" />}
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-slate-900">
                  {limitReached ? trans.limitReachedTitle : trans.uploadTitle}
                </h3>
                <p className="mt-2 max-w-sm text-sm text-slate-500">
                  {limitReached ? trans.limitReachedDesc : trans.uploadDesc}
                </p>
                <div className="mt-5 flex gap-2">
                  <span className="badge bg-slate-100 text-slate-600 flex items-center gap-1"><Camera className="h-3 w-3" /> {trans.camera}</span>
                  <span className="badge bg-slate-100 text-slate-600 flex items-center gap-1"><ImageIcon className="h-3 w-3" /> JPG / PNG</span>
                  <span className="badge bg-green-50 text-green-700 flex items-center gap-1"><Sparkles className="h-3 w-3" /> {trans.onDevice}</span>
                </div>
              </div>
            )}

            {imageUrl && !analyzing && !report && (
              <div className="card p-6 bg-white rounded-2xl border border-slate-200 text-center">
                <img src={imageUrl} alt="Upload preview" className="mx-auto max-h-96 rounded-xl object-contain" />
                <div className="mt-6 flex justify-center gap-4">
                  <button onClick={clearImage} className="btn-secondary px-4 py-2 rounded-lg border font-semibold text-slate-700 hover:bg-slate-50">
                    {trans.replace}
                  </button>
                  <button onClick={() => handleFile(fileRef.current?.files?.[0])} className="btn-primary px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700">
                    {trans.analyzeNow}
                  </button>
                </div>
              </div>
            )}

            {analyzing && (
              <div className="card p-12 text-center bg-white rounded-2xl border border-slate-200">
                <Spinner className="mx-auto h-10 w-10 text-green-500" />
                <h3 className="mt-4 text-lg font-bold text-slate-800">{trans.analyzing}</h3>
              </div>
            )}

            {report && !analyzing && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-slate-800">{trans.analysisReport}</h2>
                  <button onClick={clearImage} className="text-sm font-semibold text-green-600 hover:underline">
                    + {trans.newAnalysis}
                  </button>
                </div>
                <AnalysisReport report={report} />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-slate-800">{trans.recentAnalyses}</h2>
              {history.length > 0 && (
                <button onClick={clearHistory} className="text-xs text-red-500 hover:underline">Clear all</button>
              )}
            </div>
            
            <div className="space-y-3">
              {history.length === 0 ? (
                <div className="card p-8 text-center text-sm text-slate-500 bg-white border border-slate-200 rounded-xl">
                  {trans.noAnalyses}
                </div>
              ) : (
                history.map((h, i) => {
                  // Debug log to find your crop name
                  console.log("DEBUG HISTORY DATA:", h);

                  return (
                    <div 
                      key={h.id || i} 
                      onClick={() => loadHistoryItem(h)}
                      className="card flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-green-300 hover:shadow-sm transition-all"
                    >
                      <div className="h-12 w-12 shrink-0 rounded-lg bg-green-50 flex items-center justify-center border border-green-100">
                        <Sprout className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-semibold text-sm text-slate-800">
                          {/* We will update this once we see the console log! */}
                          {h.recommendedCrop || h.crop || h.best_crop || 'No recommended crop'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {h.analyzedAt ? new Date(h.analyzedAt).toLocaleString() : 'Unknown date'}
                        </p>
                      </div>
                      <div className="shrink-0">
                        <span className="badge bg-green-50 text-green-700 font-bold">
                          {h.score || h.fertilityScore || h.healthScore || 0}/100
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </main>

      {/* PRICING MODAL */}
      {showPricing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Pick your plan</h2>
                <p className="text-sm text-slate-500">Start free. Upgrade when you need more analyses and deeper insights.</p>
              </div>
              <button onClick={() => setShowPricing(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 grid md:grid-cols-3 gap-6 bg-slate-50">
              
              {/* Free Plan */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-800">Free</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-900">$0</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6 flex-1">
                  <li className="flex gap-2 text-sm text-slate-600"><Check className="h-4 w-4 text-green-500 shrink-0" /> 3 analyses / month</li>
                  <li className="flex gap-2 text-sm text-slate-600"><Check className="h-4 w-4 text-green-500 shrink-0" /> Basic fertility score</li>
                  <li className="flex gap-2 text-sm text-slate-600"><Check className="h-4 w-4 text-green-500 shrink-0" /> Top-1 crop recommendation</li>
                </ul>
                <button disabled className="w-full py-2.5 rounded-xl border-2 border-slate-100 text-slate-400 font-semibold bg-slate-50">
                  {plan === 'free' ? 'Current plan' : 'Downgrade'}
                </button>
              </div>

              {/* Starter Plan */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-800">Starter</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-900">$4.99</span>
                    <span className="text-slate-500 text-sm">/month</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6 flex-1">
                  <li className="flex gap-2 text-sm text-slate-600"><Check className="h-4 w-4 text-green-500 shrink-0" /> 30 analyses / month</li>
                  <li className="flex gap-2 text-sm text-slate-600"><Check className="h-4 w-4 text-green-500 shrink-0" /> Full metrics & pH estimate</li>
                  <li className="flex gap-2 text-sm text-slate-600"><Check className="h-4 w-4 text-green-500 shrink-0" /> Top-3 crop recommendations</li>
                  <li className="flex gap-2 text-sm text-slate-600"><Check className="h-4 w-4 text-green-500 shrink-0" /> Cultivation calendar</li>
                </ul>
                {plan === 'starter' ? (
                  <button disabled className="w-full py-2.5 rounded-xl border-2 border-slate-100 text-slate-400 font-semibold bg-slate-50">
                    Current plan
                  </button>
                ) : (
                  <button onClick={() => handleUpgrade('starter')} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors">
                    <CreditCard className="h-4 w-4" /> Upgrade to Starter
                  </button>
                )}
              </div>

              {/* Pro Plan */}
              <div className="bg-white p-6 rounded-2xl border-2 border-green-500 shadow-md relative flex flex-col">
                <div className="absolute top-0 right-0 bg-orange-400 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl flex items-center gap-1">
                  <Crown className="h-3 w-3" /> MOST POPULAR
                </div>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-800">Pro</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-900">$12.99</span>
                    <span className="text-slate-500 text-sm">/month</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6 flex-1">
                  <li className="flex gap-2 text-sm text-slate-600"><Check className="h-4 w-4 text-green-500 shrink-0" /> <b>Unlimited</b> analyses</li>
                  <li className="flex gap-2 text-sm text-slate-600"><Check className="h-4 w-4 text-green-500 shrink-0" /> Everything in Starter</li>
                  <li className="flex gap-2 text-sm text-slate-600"><Check className="h-4 w-4 text-green-500 shrink-0" /> Season-long rotation plan</li>
                  <li className="flex gap-2 text-sm text-slate-600"><Check className="h-4 w-4 text-green-500 shrink-0" /> Exportable PDF report</li>
                  <li className="flex gap-2 text-sm text-slate-600"><Check className="h-4 w-4 text-green-500 shrink-0" /> Priority support</li>
                </ul>
                {plan === 'pro' ? (
                  <button disabled className="w-full py-2.5 rounded-xl bg-green-50 text-green-700 font-semibold border border-green-200">
                    Current plan
                  </button>
                ) : (
                  <button onClick={() => handleUpgrade('pro')} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors shadow-lg shadow-green-600/20">
                    <CreditCard className="h-4 w-4" /> Upgrade to Pro
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}