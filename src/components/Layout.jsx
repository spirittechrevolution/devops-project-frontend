import { useAuth } from '../context/AuthContext'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import '../styles/dashboard.css'

// Nous centralisons le header et la sidebar dans ce composant
// pour qu'ils apparaissent sur toutes les pages protegees
export const Layout = ({ children }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Nous utilisons useLocation pour savoir quelle page est active
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Nous verifions si le lien correspond a la page actuelle pour appliquer la classe active
  const isActive = (path) => location.pathname === path

  return (
    <div className="dashboard">

      <header className="dashboard-header">
        <div className="header-content">
          <h1>Bibliotheque DIT</h1>
          <div className="user-menu">
            <div className="user-info">
              <p className="name">{user?.firstName} {user?.lastName}</p>
              <p className="email">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              Deconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-nav">

        <nav className="sidebar">
          <ul>
            <li>
              <Link
                to="/dashboard"
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              >
                Tableau de bord
              </Link>
            </li>
            <li>
              <Link
                to="/books"
                className={`nav-link ${isActive('/books') ? 'active' : ''}`}
              >
                Livres
              </Link>
            </li>
            <li>
              <Link
                to="/borrowings"
                className={`nav-link ${isActive('/borrowings') ? 'active' : ''}`}
              >
                Emprunts
              </Link>
            </li>
            <li>
              <Link
                to="/profile"
                className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
              >
                Profil
              </Link>
            </li>
          </ul>
        </nav>

        {/* Nous injectons ici le contenu de chaque page */}
        <main className="dashboard-content">
          {children}
        </main>

      </div>
    </div>
  )
}
