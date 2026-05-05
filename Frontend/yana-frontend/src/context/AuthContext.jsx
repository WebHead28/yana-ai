import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('yana-token'))
  const [userId, setUserId] = useState(() => localStorage.getItem('yana-user-id'))

  const login = (accessToken, uid) => {
    localStorage.setItem('yana-token', accessToken)
    localStorage.setItem('yana-user-id', uid)
    setToken(accessToken)
    setUserId(uid)
  }

  const logout = () => {
    localStorage.removeItem('yana-token')
    localStorage.removeItem('yana-user-id')
    setToken(null)
    setUserId(null)
  }

  return (
    <AuthContext.Provider value={{ token, userId, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
