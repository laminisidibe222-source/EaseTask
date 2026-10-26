import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import AuthLayout from './AuthLayout.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Signup() {
  const { signUp, isConfigured } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmEmail, setConfirmEmail] = useState(false)

  const pwStrong = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    try {
      await signUp(email, password, fullName)
      setConfirmEmail(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      setError(err.message || 'Could not create account.')
    } finally {
      setLoading(false)
    }
  }

  if (confirmEmail) {
    return (
      <AuthLayout title="Check your inbox" subtitle="We sent a confirmation link.">
        <div className="flex flex-col items-center rounded-2xl border border-brand-200 bg-brand-50 p-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-brand-600" />
          <p className="mt-4 font-semibold text-slate-800">Account created!</p>
          <p className="mt-1 text-sm text-slate-600">Confirm your email, then sign in. Redirecting…</p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start with 3 free analyses every month. No credit card needed."
      footer={<>Already have an account? <Link to="/login" className="font-semibold text-brand-600 hover:underline">Sign in</Link></>}
    >
      {!isConfigured && (
        <div className="mb-5 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Demo mode — add Supabase keys in <code className="rounded bg-amber-100 px-1">.env</code> for real sign-up.</span>
        </div>
      )}
      {error && (
        <div className="mb-5 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Full name</label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Aminata Diop" className="input-field !pl-10" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="input-field !pl-10" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type={showPw ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" className="input-field !pl-10 !pr-10" />
            <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password && (
            <p className={`mt-1.5 text-xs ${pwStrong ? 'text-brand-600' : 'text-slate-400'}`}>
              {pwStrong ? '✓ Strong password' : 'Tip: 8+ chars, uppercase & a number makes it strong.'}
            </p>
          )}
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</> : 'Create free account'}
        </button>
        <p className="text-center text-xs text-slate-400">By signing up you agree to our Terms & Privacy Policy.</p>
      </form>
    </AuthLayout>
  )
}
