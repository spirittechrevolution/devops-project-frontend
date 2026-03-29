import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { bookService, borrowingService } from '../services/apiService'
import { Layout } from '../components/Layout'

export const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [stats, setStats] = useState({
    totalBooks: 0,
    totalBorrowings: 0,
    activeBorrowings: 0,
    overdueBorrowings: 0,
  })

  const [loadingStats, setLoadingStats] = useState(true)

  // Nous verifions si l'utilisateur est admin une seule fois
  const isAdmin = user?.userType === 'admin'

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoadingStats(true)
    try {
      let borrowings = []

      if (isAdmin) {
        // Nous chargeons tous les emprunts pour l'admin
        const [booksResponse, borrowingsResponse] = await Promise.all([
          bookService.getAllBooks(1, 1),
          borrowingService.getAllBorrowings(),
        ])
        borrowings = borrowingsResponse.data.data || []

        setStats({
          totalBooks: booksResponse.data.pagination?.total || booksResponse.data.data?.length || 0,
          totalBorrowings: borrowings.length,
          activeBorrowings: borrowings.filter((b) => b.status === 'active').length,
          overdueBorrowings: borrowings.filter((b) => b.status === 'overdue').length,
        })
      } else {
        // Nous chargeons seulement les emprunts de l'utilisateur connecte
        const [booksResponse, myBorrowingsResponse] = await Promise.all([
          bookService.getAllBooks(1, 1),
          borrowingService.getMyBorrowings(),
        ])
        borrowings = myBorrowingsResponse.data.data || []

        setStats({
          totalBooks: booksResponse.data.pagination?.total || booksResponse.data.data?.length || 0,
          totalBorrowings: borrowings.length,
          activeBorrowings: borrowings.filter((b) => b.status === 'active').length,
          overdueBorrowings: borrowings.filter((b) => b.status === 'overdue').length,
        })
      }
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques', err)
    } finally {
      setLoadingStats(false)
    }
  }

  // Nous lisons userType et non role — c'est le champ reel retourne par le backend
  const getFonctionLabel = (userType) => {
    const fonctions = {
      student: 'Etudiant',
      professor: 'Professeur',
      admin: 'Personnel administratif',
    }
    return fonctions[userType] || userType || 'Non defini'
  }

  return (
    <Layout>

      <div className="welcome-section">
        <h2>Bienvenue, {user?.firstName} !</h2>
        <p>
          {isAdmin
            ? 'Vous gerez la bibliotheque du Dakar Institute of Technology.'
            : 'Consultez les livres disponibles et suivez vos emprunts.'}
        </p>
      </div>

      {/* Statistiques adaptees selon le profil de l'utilisateur */}
      <div className="quick-stats">

        <div className="stat-card" onClick={() => navigate('/books')}>
          <p className="title">Total livres</p>
          <p className="value">{loadingStats ? '...' : stats.totalBooks}</p>
          <p className="description">Livres disponibles dans la bibliotheque</p>
          <Link to="/books">Voir les livres</Link>
        </div>

        <div className="stat-card" onClick={() => navigate('/borrowings')}>
          <p className="title">
            {isAdmin ? 'Total emprunts' : 'Mes emprunts'}
          </p>
          <p className="value">{loadingStats ? '...' : stats.totalBorrowings}</p>
          <p className="description">
            {isAdmin ? 'Emprunts enregistres au total' : 'Emprunts que vous avez effectues'}
          </p>
          <Link to="/borrowings">Voir les emprunts</Link>
        </div>

        <div className="stat-card" onClick={() => navigate('/borrowings')}>
          <p className="title">En cours</p>
          <p className="value">{loadingStats ? '...' : stats.activeBorrowings}</p>
          <p className="description">
            {isAdmin ? 'Livres actuellement empruntes' : 'Livres que vous avez en main'}
          </p>
          <Link to="/borrowings">Voir les details</Link>
        </div>

        <div className="stat-card" onClick={() => navigate('/borrowings')}>
          <p className="title">Retards</p>
          <p className="value">{loadingStats ? '...' : stats.overdueBorrowings}</p>
          <p className="description">Emprunts dont la date limite est depassee</p>
          <Link to="/borrowings">Voir les retards</Link>
        </div>

      </div>

      {/* Informations du compte connecte */}
      <div className="info-section">
        <h3>Mon compte</h3>
        <p>
          <strong>Nom complet :</strong>{' '}
          <span>{user?.firstName} {user?.lastName}</span>
        </p>
        <p>
          <strong>Email :</strong>{' '}
          <span>{user?.email}</span>
        </p>
        <p>
          {/* Nous lisons userType et non role qui n'existe pas dans la reponse backend */}
          <strong>Fonction :</strong>{' '}
          <span>{getFonctionLabel(user?.userType)}</span>
        </p>
      </div>

    </Layout>
  )
}