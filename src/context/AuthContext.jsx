import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, isConfigured } from '../lib/supabase.js'

const AuthContext = createContext(null)

const DEMO_USER = {
  id: 'demo-user',
  email: 'demo@easetask.app',
  user_metadata: { full_name: 'Demo Farmer' },
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null) // { plan, full_name, analyses_this_month, ... }
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId) => {
    if (!isConfigured || !userId) return
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) setProfile(data)
  }, [])

  useEffect(() => {
    if (!isConfigured) {
      // Demo mode: auto-sign-in so the app is explorable without Supabase keys.
      setUser(DEMO_USER)
      setProfile({ id: DEMO_USER.id, plan: 'free', full_name: 'Demo Farmer', analyses_this_month: 0 })
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) fetchProfile(u.id)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) fetchProfile(u.id)
      else setProfile(null)
    })
    return () => sub.subscription.unsubscribe()
  }, [fetchProfile])

  const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw error
    return data
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    if (isConfigured) await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const refreshProfile = useCallback(() => user && fetchProfile(user.id), [user, fetchProfile])

  const value = {
    user,
    profile,
    loading,
    isConfigured,
    signUp,
    signIn,
    signOut,
    refreshProfile,
    setProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
