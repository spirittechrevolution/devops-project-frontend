import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import '../styles/dashboard.css'

export const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>DevOps Project</h1>
          <div className="user-menu">
            <span>Bienvenue, {user?.firstName}!</span>
            <button onClick={handleLogout} className="logout-btn">
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-nav">
        <nav className="sidebar">
          <ul>
            <li>
              <a href="/dashboard" className="nav-link active">
                Tableau de bord
              </a>
            </li>
            <li>
              <a href="/books" className="nav-link">
                Livres
              </a>
            </li>
            <li>
              <a href="/borrowings" className="nav-link">
                Emprunts
              </a>
            </li>
            <li>
              <a href="/profile" className="nav-link">
                Profil
              </a>
            </li>
          </ul>
        </nav>

        <main className="dashboard-content">
          <div className="welcome-section">
            <h2>Bienvenue sur le DevOps Dashboard</h2>
            <p>Gérez vos projets, tâches, et ressources en un seul endroit.</p>

            <div className="quick-stats">
              <div className="stat-card">
                <p className="stat-title">Bibliothèque</p>
                <a href="/books">Gérer les livres</a>
              </div>

              <div className="stat-card">
                <p className="stat-title">Emprunts</p>
                <a href="/borrowings">Voir les emprunts</a>
              </div>
            </div>

            <div className="info-section">
              <h3>Informations utilisateur</h3>
              <p>
                <strong>Nom:</strong> {user?.firstName} {user?.lastName}
              </p>
              <p>
                <strong>Email:</strong> {user?.email}
              </p>
              <p>
                <strong>Rôle:</strong> {user?.role || 'Utilisateur'}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
