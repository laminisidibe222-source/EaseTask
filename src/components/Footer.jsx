import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'
import { Mail, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm text-slate-500">
              EaseTask turns a simple photo of your land into a fertility report and a personalized cultivation plan. Built for farmers in West Africa and beyond.
            </p>
            <div className="mt-4 space-y-1.5 text-sm text-slate-500">
              <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@easetask.app</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Dakar, Senegal</p>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Product</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li><Link to="/#features" className="hover:text-brand-600">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-brand-600">Pricing</Link></li>
              <li><Link to="/signup" className="hover:text-brand-600">Get started</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Account</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li><Link to="/login" className="hover:text-brand-600">Sign in</Link></li>
              <li><Link to="/signup" className="hover:text-brand-600">Create account</Link></li>
              <li><Link to="/dashboard" className="hover:text-brand-600">Dashboard</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} EaseTask. Analysis is an estimate — always confirm with a soil test for critical decisions.
        </div>
      </div>
    </footer>
  )
}
