import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { borrowingService } from '../services/apiService'
import { Layout } from '../components/Layout'
import '../styles/list-page.css'
import '../styles/modal.css'

export const Borrowings = () => {
  const { user } = useAuth()

  const [borrowings, setBorrowings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedBorrowing, setSelectedBorrowing] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')

  const isAdmin = user?.userType === 'admin'

  useEffect(() => {
    fetchBorrowings()
  }, [])

  const fetchBorrowings = async () => {
    setLoading(true)
    try {
      let response

      if (isAdmin) {
        // Nous chargeons tous les emprunts pour l'admin
        response = await borrowingService.getAllBorrowings()
      } else {
        // Nous chargeons uniquement les emprunts de l'utilisateur connecte
        response = await borrowingService.getMyBorrowings()
      }

      setBorrowings(response.data.data || [])
      setError('')
    } catch (err) {
      const status = err.response?.status
      if (status === 403) {
        setError('Acces refuse : vous n\'avez pas les droits necessaires')
      } else if (status === 401) {
        setError('Votre session a expire, veuillez vous reconnecter')
      } else {
        setError('Erreur lors du chargement des emprunts. Veuillez reessayer.')
      }
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleReturnBook = async (borrowingId) => {
    setLoading(true)
    try {
      await borrowingService.returnBook(borrowingId)
      setSuccess('Livre retourne avec succes !')
      setTimeout(() => setSuccess(''), 3000)
      fetchBorrowings()
    } catch (err) {
      const status = err.response?.status
      if (status === 403) {
        setError('Acces refuse : vous ne pouvez pas effectuer cette action')
      } else if (status === 404) {
        setError('Cet emprunt est introuvable')
      } else {
        setError('Erreur lors de la restitution du livre. Veuillez reessayer.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleShowDetails = (borrowing) => setSelectedBorrowing(borrowing)
  const handleCloseDetails = () => setSelectedBorrowing(null)

  const getStatusLabel = (status) => {
    const labels = { active: 'En cours', returned: 'Retourne', overdue: 'En retard' }
    return labels[status] || status
  }

  const getStatusClass = (status) => {
    const classes = { active: 'active', returned: 'returned', overdue: 'overdue' }
    return classes[status] || ''
  }

  const getDaysOverdue = (dueDate) => {
    if (!dueDate) return 0
    const diff = Math.floor((new Date() - new Date(dueDate)) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }

  const filteredBorrowings = borrowings.filter((b) =>
    activeFilter === 'all' ? true : b.status === activeFilter
  )

  const counts = {
    all: borrowings.length,
    active: borrowings.filter((b) => b.status === 'active').length,
    returned: borrowings.filter((b) => b.status === 'returned').length,
    overdue: borrowings.filter((b) => b.status === 'overdue').length,
  }

  return (
    <Layout>

      <div className="page-header">
        <h1 className="page-title">
          {isAdmin ? 'Tous les emprunts' : 'Mes emprunts'}
        </h1>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="filter-bar">
        {['all', 'active', 'overdue', 'returned'].map((filter) => {
          const labels = {
            all: 'Tous',
            active: 'En cours',
            overdue: 'En retard',
            returned: 'Retournes',
          }
          return (
            <button
              key={filter}
              className={`filter-btn ${filter === 'overdue' ? 'filter-btn-overdue' : ''} ${activeFilter === filter ? 'filter-btn-active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {labels[filter]} ({counts[filter]})
            </button>
          )
        })}
      </div>

      {loading && <p className="loading">Chargement...</p>}

      <div className="list-grid">
        {!loading && filteredBorrowings.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📋</div>
            <h3>Aucun emprunt trouve</h3>
            <p>
              {borrowings.length === 0
                ? 'Vous n\'avez pas encore emprunte de livre.'
                : 'Aucun emprunt ne correspond au filtre selectionne.'}
            </p>
          </div>
        ) : (
          filteredBorrowings.map((borrowing) => (
            <div key={borrowing.id} className="card">
              <div className="card-header">
                <h3>{borrowing.book?.title || 'Livre supprime'}</h3>
                <span className={`status-badge ${getStatusClass(borrowing.status)}`}>
                  {getStatusLabel(borrowing.status)}
                </span>
              </div>

              <div className="card-body">
                <p><strong>Auteur :</strong> {borrowing.book?.author || 'N/A'}</p>
                {isAdmin && (
                  <p>
                    <strong>Emprunteur :</strong>{' '}
                    {borrowing.user?.firstName} {borrowing.user?.lastName}
                  </p>
                )}
                {borrowing.borrowDate && (
                  <p>
                    <strong>Date d'emprunt :</strong>{' '}
                    {new Date(borrowing.borrowDate).toLocaleDateString('fr-FR')}
                  </p>
                )}
                {borrowing.dueDate && (
                  <p>
                    <strong>Date limite :</strong>{' '}
                    {new Date(borrowing.dueDate).toLocaleDateString('fr-FR')}
                  </p>
                )}
                {borrowing.returnDate && (
                  <p>
                    <strong>Date de retour :</strong>{' '}
                    {new Date(borrowing.returnDate).toLocaleDateString('fr-FR')}
                  </p>
                )}
                {borrowing.status === 'overdue' && (
                  <p className="overdue-warning">
                    Retard de {getDaysOverdue(borrowing.dueDate)} jour(s)
                  </p>
                )}
              </div>

              <div className="card-footer">
                {borrowing.status !== 'returned' && (
                  <button
                    onClick={() => handleReturnBook(borrowing.id)}
                    className="action-btn primary"
                    disabled={loading}
                  >
                    Retourner le livre
                  </button>
                )}
                <button
                  className="action-btn secondary"
                  onClick={() => handleShowDetails(borrowing)}
                >
                  Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedBorrowing && (
        <div className="modal-overlay" onClick={handleCloseDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Details de l'emprunt</h2>
              <button className="modal-close" onClick={handleCloseDetails}>X</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Livre</h3>
                <p><strong>Titre :</strong> {selectedBorrowing.book?.title || 'N/A'}</p>
                <p><strong>Auteur :</strong> {selectedBorrowing.book?.author || 'N/A'}</p>
                <p><strong>ISBN :</strong> {selectedBorrowing.book?.isbn || 'N/A'}</p>
                <p><strong>Categorie :</strong> {selectedBorrowing.book?.category || 'N/A'}</p>
              </div>
              {isAdmin && (
                <div className="detail-section">
                  <h3>Emprunteur</h3>
                  <p>
                    <strong>Nom :</strong>{' '}
                    {selectedBorrowing.user?.firstName} {selectedBorrowing.user?.lastName}
                  </p>
                  <p><strong>Email :</strong> {selectedBorrowing.user?.email}</p>
                </div>
              )}
              <div className="detail-section">
                <h3>Dates</h3>
                <p>
                  <strong>Date d'emprunt :</strong>{' '}
                  {selectedBorrowing.borrowDate
                    ? new Date(selectedBorrowing.borrowDate).toLocaleDateString('fr-FR')
                    : 'N/A'}
                </p>
                <p>
                  <strong>Date limite :</strong>{' '}
                  {selectedBorrowing.dueDate
                    ? new Date(selectedBorrowing.dueDate).toLocaleDateString('fr-FR')
                    : 'N/A'}
                </p>
                {selectedBorrowing.returnDate && (
                  <p>
                    <strong>Date de retour :</strong>{' '}
                    {new Date(selectedBorrowing.returnDate).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
              <div className="detail-section">
                <h3>Statut</h3>
                <span className={`status-badge ${getStatusClass(selectedBorrowing.status)}`}>
                  {getStatusLabel(selectedBorrowing.status)}
                </span>
                {selectedBorrowing.status === 'overdue' && (
                  <p className="overdue-warning" style={{ marginTop: '10px' }}>
                    Retard de {getDaysOverdue(selectedBorrowing.dueDate)} jour(s)
                  </p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={handleCloseDetails} className="action-btn primary">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  )
}