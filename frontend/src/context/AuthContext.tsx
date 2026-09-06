import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { AuthUser } from '../types'

interface AuthContextValue {
  user: AuthUser | null
  // viewRole allows demo role-toggle without re-authenticating
  viewRole: 'ADMIN' | 'CLIENT'
  setViewRole: (role: 'ADMIN' | 'CLIENT') => void
  login: (user: AuthUser) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEY = 'auth'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const [viewRole, setViewRoleState] = useState<'ADMIN' | 'CLIENT'>(() => {
    return (localStorage.getItem('viewRole') as 'ADMIN' | 'CLIENT') ?? 'ADMIN'
  })

  // Keep viewRole in sync with the real role whenever user logs in
  useEffect(() => {
    if (user) setViewRoleState(user.role)
  }, [user?.userId])

  const login = useCallback((authUser: AuthUser) => {
    setUser(authUser)
    setViewRoleState(authUser.role)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser))
    localStorage.setItem('viewRole', authUser.role)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem('viewRole')
  }, [])

  const setViewRole = useCallback((role: 'ADMIN' | 'CLIENT') => {
    setViewRoleState(role)
    localStorage.setItem('viewRole', role)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, viewRole, setViewRole, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
