"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { jwtDecode } from 'jwt-decode'

interface User {
  id: string
  username: string
  isAdmin: boolean
  isManager: boolean
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  loading: true,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const decoded: any = jwtDecode(token)
        // Check expiration
        if (decoded.exp * 1000 < Date.now()) {
          logout()
        } else {
          setUser({
            id: decoded.sub,
            username: decoded.username,
            isAdmin: decoded.isAdmin,
            isManager: decoded.isManager || false,
          })
        }
      } catch (e) {
        logout()
      }
    }
    setLoading(false)
  }, [])

  const login = (token: string) => {
    localStorage.setItem('token', token)
    const decoded: any = jwtDecode(token)
    setUser({
      id: decoded.sub,
      username: decoded.username,
      isAdmin: decoded.isAdmin,
      isManager: decoded.isManager || false,
    })
    router.push('/')
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    router.push('/login')
  }

  // Protect routes
  useEffect(() => {
    if (!loading) {
      const isLoginPage = pathname === '/login'
      if (!user && !isLoginPage) {
        router.push('/login')
      }
      if (user && isLoginPage) {
        router.push('/')
      }
    }
  }, [user, loading, pathname, router])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

