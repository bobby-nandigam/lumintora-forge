import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('lumintora_token')
    if (token) {
      api.me().then(setUser).catch(() => {
        localStorage.removeItem('lumintora_token')
      }).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const { token, user } = await api.login({ email, password })
    localStorage.setItem('lumintora_token', token)
    setUser(user)
    return user
  }

  const register = async (email, name, username, password) => {
    const { token, user } = await api.register({ email, name, username, password })
    localStorage.setItem('lumintora_token', token)
    setUser(user)
    return user
  }

  const loginWithToken = async (token) => {
    localStorage.setItem('lumintora_token', token)
    const u = await api.me()
    setUser(u)
    return u
  }

  const logout = () => {
    localStorage.removeItem('lumintora_token')
    setUser(null)
  }

  const refreshUser = () => api.me().then(setUser)

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithToken, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
