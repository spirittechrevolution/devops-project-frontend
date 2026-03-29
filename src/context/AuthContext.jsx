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

  // Nous traduisons les messages d'erreur retournes par le backend
  const traduireErreur = (message) => {
    const erreurs = {
      'Email already registered': 'Cette adresse email est deja utilisee',
      'Invalid credentials': 'Email ou mot de passe incorrect',
      'User account is inactive': "Ce compte est desactive, contactez l'administration",
      'User not found': 'Utilisateur introuvable',
      'Invalid current password': 'Mot de passe actuel incorrect',
    }
    return erreurs[message] || message
  }

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
      const rawMessage = err.response?.data?.message || "Erreur lors de l'inscription"
      const message = traduireErreur(rawMessage)
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
      const rawMessage = err.response?.data?.message || 'Erreur lors de la connexion'
      const message = traduireErreur(rawMessage)
      setError(message)
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }

  // Nous mettons a jour le user en memoire et dans le localStorage apres modification du profil
  const updateUser = (updatedFields) => {
    const updatedUser = { ...user, ...updatedFields }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    setUser(updatedUser)
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
    updateUser,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth doit etre utilise dans AuthProvider')
  }
  return context
}