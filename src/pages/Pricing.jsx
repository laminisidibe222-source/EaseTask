import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Crown, Sparkles, CreditCard, AlertCircle, Loader2 } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { PLANS, openCheckout } from '../lib/payment.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function Pricing() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [opening, setOpening] = useState(null)
  const [notice, setNotice] = useState('')

  const handleUpgrade = async (planId) => {
    if (!user) { navigate('/signup'); return }
    setNotice('')
    setOpening(planId)
    // Small delay so the spinner is visible; real checkout opens in new tab.
    setTimeout(() => {
      const ok = openCheckout(planId)
      setOpening(null)
      if (!ok) {
        setNotice('Checkout is being set up. Add your Lemon Squeezy product URLs in .env — no company needed, see README.')
      }
    }, 600)
  }

  const order = ['free', 'starter', 'pro']
  const currentPlan = profile?.plan || 'free'

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="badge bg-amber-50 text-amber-700 ring-1 ring-amber-200"><Sparkles className="h-3.5 w-3.5" /> Simple pricing, cancel anytime</span>
            <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">Pick your plan</h1>
            <p className="mt-4 text-slate-600">Start free. Upgrade when you need more analyses and deeper insights. Pay by card worldwide — no company registration required.</p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {order.map(id => {
              const p = PLANS[id]
              const highlighted = id === 'pro'
              const isCurrent = currentPlan === id
              return (
                <div key={id} className={`relative card flex flex-col p-7 ${highlighted ? 'border-brand-500 shadow-xl shadow-brand-600/10 ring-2 ring-brand-500' : ''}`}>
                  {highlighted && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                      <Crown className="mr-1 inline h-3 w-3" /> MOST POPULAR
                    </span>
                  )}
                  <h3 className="font-display text-lg font-bold text-slate-900">{p.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="font-display text-4xl font-extrabold text-slate-900">${p.price}</span>
                    {p.price > 0 && <span className="text-sm text-slate-500">/{p.period}</span>}
                  </div>
                  <ul className="mt-6 flex-1 space-y-3">
                    {p.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" /> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleUpgrade(id)}
                    disabled={isCurrent || opening === id}
                    className={`mt-7 w-full ${highlighted ? 'btn-primary' : 'btn-secondary'} !py-3`}
                  >
                    {isCurrent ? 'Current plan' : opening === id ? <><Loader2 className="h-4 w-4 animate-spin" /> Opening checkout…</> : p.price === 0 ? 'Start free' : <><CreditCard className="h-4 w-4" /> Upgrade to {p.name}</>}
                  </button>
                </div>
              )
            })}
          </div>

          {notice && (
            <div className="mx-auto mt-8 flex max-w-2xl gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {notice}
            </div>
          )}

          {/* Payment note for Senegal */}
          <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="flex items-center gap-2 font-display text-base font-bold text-slate-900"><CreditCard className="h-5 w-5 text-brand-600" /> About payments — for founders in Senegal</h3>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>EaseTask uses <b>Lemon Squeezy</b> as the payment processor — a <i>Merchant of Record</i>. That means:</p>
              <ul className="ml-5 list-disc space-y-1">
                <li>No registered company required — individuals / sole traders are accepted.</li>
                <li>Accepts Visa, Mastercard, Apple Pay & Google Pay from customers worldwide.</li>
                <li>Handles taxes, fraud and chargebacks for you; payouts to your bank or Wise.</li>
                <li>Alternative if you prefer: <b>Paddle</b> (also merchant-of-record) or <b>Stripe</b> via a supported entity.</li>
              </ul>
              <p className="text-xs text-slate-400">To go live: create a free Lemon Squeezy account, add two subscription products, paste their checkout URLs into <code className="rounded bg-slate-100 px-1">.env</code>. See the README for full steps.</p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link to="/signup" className="text-sm font-semibold text-brand-600 hover:underline">New here? Create a free account →</Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
