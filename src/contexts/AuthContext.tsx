import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getCurrentUserProfile } from '@/services/auth'
import type { AppUser } from '@/types/database'

interface AuthContextValue {
  user: User | null
  profile: AppUser | null
  loading: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(uid: string) {
    try {
      const data = await getCurrentUserProfile(uid)
      setProfile(data as unknown as AppUser)
    } catch {
      setProfile(null)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Force a fresh ID token on every sign-in state change (fresh login,
        // page reload with a persisted session, etc.) — not just right after
        // sign-up. A stale token has been the suspected cause of intermittent
        // "Missing or insufficient permissions" errors on writes even when
        // the user is genuinely signed in and owns the document.
        try {
          await firebaseUser.getIdToken(true)
        } catch {
          // Non-fatal — proceed with whatever token is already cached
        }
      }
      setUser(firebaseUser)
      if (firebaseUser) {
        await loadProfile(firebaseUser.uid)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  async function refreshProfile() {
    if (user) await loadProfile(user.uid)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
