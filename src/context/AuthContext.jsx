import { createContext, useContext, useState, useEffect } from 'react'
import { userService } from '../services/apiService'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const register = async (userData) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await userService.register(userData)
      const { token, user } = response.data.data
      localStorage.setItem('authToken', token)
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)
      return { success: true, data: user }
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de l\'inscription'
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await userService.login(credentials)
      const { token, user } = response.data.data
      localStorage.setItem('authToken', token)
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)
      return { success: true, data: user }
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la connexion'
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    setUser(null)
  }

  const value = {
    user,
    isLoading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans AuthProvider')
  }
  return context
}
