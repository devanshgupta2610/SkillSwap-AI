import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authApi } from '../services/endpoints'
import { getErrorMessage } from '../services/api'
import type { TokenResponse, User, UserRole } from '../types'
import toast from 'react-hot-toast'

interface AuthContextValue {
  user: User | null
  role: UserRole | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (payload: {
    email: string
    password: string
    full_name: string
    role: UserRole
  }) => Promise<void>
  logout: () => void
  refreshMe: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function persistSession(data: TokenResponse) {
  localStorage.setItem('access_token', data.access_token)
  localStorage.setItem('refresh_token', data.refresh_token)
  localStorage.setItem('user_role', data.role)
  localStorage.setItem('user_id', String(data.user_id))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshMe = useCallback(async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setUser(null)
      return
    }
    const me = await authApi.me()
    setUser(me)
  }, [])

  useEffect(() => {
    refreshMe()
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [refreshMe])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const data = await authApi.login({ email, password })
      persistSession(data)
      await refreshMe()
      toast.success('Welcome back')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Login failed'))
      throw err
    }
  }, [refreshMe])

  const register = useCallback(
    async (payload: { email: string; password: string; full_name: string; role: UserRole }) => {
      try {
        const data = await authApi.register(payload)
        persistSession(data)
        await refreshMe()
        toast.success('Account created')
      } catch (err) {
        toast.error(getErrorMessage(err, 'Registration failed'))
        throw err
      }
    },
    [refreshMe],
  )

  const logout = useCallback(() => {
    localStorage.clear()
    setUser(null)
    toast.success('Signed out')
  }, [])

  const value = useMemo(
    () => ({
      user,
      role: user?.role ?? (localStorage.getItem('user_role') as UserRole | null),
      loading,
      login,
      register,
      logout,
      refreshMe,
    }),
    [user, loading, login, register, logout, refreshMe],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
