import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react'
import { apiFetch } from './lib/api'

type AuthContextValue = {
  token: string | null
  signin: (username: string, password: string) => Promise<void>
  signup: (username: string, password: string) => Promise<void>
  signout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      async signin(username, password) {
        const res = await apiFetch('/api/v1/signin', {
          method: 'POST',
          body: JSON.stringify({ username, password }),
        })
        if (!res.ok) throw new Error('Invalid credentials')
        const data = (await res.json()) as { token: string }
        localStorage.setItem('token', data.token)
        setToken(data.token)
      },
      async signup(username, password) {
        const res = await apiFetch('/api/v1/signup', {
          method: 'POST',
          body: JSON.stringify({ username, password }),
        })
        if (!res.ok) {
          let message = 'Signup failed'
          try {
            const data = (await res.json()) as { message?: string }
            if (data && data.message) message = data.message
          } catch {
            // ignore JSON parsing errors and use default message
          }
          throw new Error(message)
        }
      },
      signout() {
        localStorage.removeItem('token')
        setToken(null)
      },
    }),
    [token],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


