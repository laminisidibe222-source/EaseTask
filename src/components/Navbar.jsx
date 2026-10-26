import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X, LayoutDashboard, LogOut, Crown } from 'lucide-react'
import Logo from './Logo.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 glass">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Logo />
        <div className="hidden items-center gap-2 md:flex">
          <Link to="/#features" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:text-brand-700">Features</Link>
          <Link to="/#how" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:text-brand-700">How it works</Link>
          <Link to="/pricing" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:text-brand-700">Pricing</Link>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              {profile?.plan !== 'pro' && (
                <Link to="/pricing" className="btn-secondary !py-2 !px-3.5 text-xs">
                  <Crown className="h-3.5 w-3.5 text-amber-500" /> Upgrade
                </Link>
              )}
              <Link to="/dashboard" className="btn-secondary !py-2 !px-3.5 text-xs">
                <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
              </Link>
              <button onClick={handleSignOut} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-red-600" title="Sign out">
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary !py-2 !px-4 text-xs">Sign in</Link>
              <Link to="/signup" className="btn-primary !py-2 !px-4 text-xs">Get started free</Link>
            </>
          )}
        </div>
        <button className="rounded-lg p-2 text-slate-600 md:hidden" onClick={() => setOpen(v => !v)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>
      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            <Link to="/#features" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Features</Link>
            <Link to="/#how" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">How it works</Link>
            <Link to="/pricing" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Pricing</Link>
            <div className="my-2 border-t border-slate-100" />
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)} className="btn-primary !py-2 text-xs">Dashboard</Link>
                <button onClick={handleSignOut} className="btn-secondary !py-2 text-xs">Sign out</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary !py-2 text-xs">Sign in</Link>
                <Link to="/signup" onClick={() => setOpen(false)} className="btn-primary !py-2 text-xs">Get started free</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
