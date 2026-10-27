import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isConfigured } from '../lib/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [demoMode, setDemoMode] = useState(!isConfigured)

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false)
      return
    }

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      console.log('🔍 Current session:', session?.user || 'No user')
      setUser(session?.user || null)
      setLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔍 Auth event:', event, session?.user || 'No user')
        setUser(session?.user || null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    if (!isConfigured) return { error: null }
    const result = await supabase.auth.signInWithPassword({ email, password })
    console.log('🔍 SignIn result:', result)
    return result
  }

  const signUp = async (email, password, fullName = '') => {
    if (!isConfigured) return { error: null }
    const result = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    })
    console.log('🔍 SignUp result:', result)
    return result
  }

  const signOut = async () => {
    if (!isConfigured) return
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-green-50">
        <p className="text-green-700 text-lg font-medium">Loading EaseTask...</p>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{
      user,
      demoMode,
      loading,
      signIn,
      signUp,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)