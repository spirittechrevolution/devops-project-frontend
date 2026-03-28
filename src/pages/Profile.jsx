import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { userService } from '../services/apiService'
import { Layout } from '../components/Layout'
import '../styles/profile.css'

export const Profile = () => {
  const { user, updateUser } = useAuth()

  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
  })

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await userService.updateProfile(formData)

      updateUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
      })

      setSuccess('Profil mis a jour avec succes !')
      setEditMode(false)
    } catch (err) {
      const msg = err.response?.data?.message
      setError(msg || 'Erreur lors de la mise a jour du profil')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    if (passwordData.newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caracteres')
      return
    }

    setLoading(true)
    try {
      await userService.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      })
      setSuccess('Mot de passe change avec succes !')
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      const msg = err.response?.data?.message
      if (msg === 'Invalid current password') {
        setError('Mot de passe actuel incorrect')
      } else {
        setError(msg || 'Erreur lors du changement de mot de passe')
      }
    } finally {
      setLoading(false)
    }
  }

  const getFonctionLabel = (userType) => {
    const fonctions = {
      student: 'Etudiant',
      professor: 'Professeur',
      admin: 'Personnel administratif',
    }
    return fonctions[userType] || userType || 'Non defini'
  }

  const handleCancelEdit = () => {
    setEditMode(false)
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
    })
    setError('')
  }

  return (
    <Layout>

      <h1>Mon Profil</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="profile-container">

        <div className="profile-section">
          <h3>Informations personnelles</h3>

          {!editMode ? (
            <div>
              <div className="profile-info">
                <div className="info-item">
                  <span className="info-label">Prenom</span>
                  <span className="info-value">{user?.firstName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Nom</span>
                  <span className="info-value">{user?.lastName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email</span>
                  <span className="info-value">{user?.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Fonction</span>
                  <span className="info-value">{getFonctionLabel(user?.userType)}</span>
                </div>
              </div>
              <div className="profile-actions">
                <button onClick={() => setEditMode(true)} className="edit-btn">
                  Modifier
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="edit-form">
              <div className="form-group">
                <label>Prenom</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nom</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? 'Mise a jour...' : 'Enregistrer'}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCancelEdit}
                  disabled={loading}
                >
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="profile-section">
          <h3>Changer le mot de passe</h3>
          <form onSubmit={handleChangePassword} className="password-form">
            <div className="form-group">
              <label>Mot de passe actuel</label>
              <input
                type="password"
                value={passwordData.oldPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, oldPassword: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Nouveau mot de passe</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="save-btn" disabled={loading}>
                {loading ? 'Changement en cours...' : 'Changer le mot de passe'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </Layout>
  )
}