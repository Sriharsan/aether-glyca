import { createContext, useContext, useState, ReactNode } from 'react'

interface AuthUser {
  token: string
  role: 'patient' | 'clinician' | 'admin'
  userId: string
  fullName: string
}

interface AuthCtx {
  user: AuthUser | null
  login: (u: AuthUser) => void
  logout: () => void
}

const Ctx = createContext<AuthCtx>({} as AuthCtx)

export function AuthProvider({ children }: { children: ReactNode }) {
  const stored = localStorage.getItem('auth')
  const [user, setUser] = useState<AuthUser | null>(stored ? JSON.parse(stored) : null)

  const login = (u: AuthUser) => {
    localStorage.setItem('auth', JSON.stringify(u))
    localStorage.setItem('token', u.token)
    setUser(u)
  }
  const logout = () => {
    localStorage.removeItem('auth')
    localStorage.removeItem('token')
    setUser(null)
  }
  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
