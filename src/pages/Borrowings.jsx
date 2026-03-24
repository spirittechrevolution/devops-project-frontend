import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { borrowingService } from '../services/apiService'
import '../styles/list-page.css'
import '../styles/modal.css'

export const Borrowings = () => {
  const navigate = useNavigate()
  const [borrowings, setBorrowings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedBorrowing, setSelectedBorrowing] = useState(null)

  useEffect(() => {
    fetchBorrowings()
  }, [])

  const fetchBorrowings = async () => {
    setLoading(true)
    try {
      const response = await borrowingService.getAllBorrowings()
      setBorrowings(response.data.data || [])
      setError('')
    } catch (err) {
      setError('Erreur lors du chargement des emprunts')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleReturnBook = async (borrowingId) => {
    setLoading(true)
    try {
      await borrowingService.returnBook(borrowingId)
      setSuccess('Livre retourné avec succès!')
      setTimeout(() => setSuccess(''), 3000)
      fetchBorrowings()
    } catch (err) {
      setError('Erreur lors de la restitution du livre')
    } finally {
      setLoading(false)
    }
  }

  const handleShowDetails = (borrowing) => {
    setSelectedBorrowing(borrowing)
  }

  const handleCloseDetails = () => {
    setSelectedBorrowing(null)
  }

  const getStatusColor = (status) => {
    const colors = {
      active: '#0066cc',
      returned: '#00aa00',
      overdue: '#cc0000',
    }
    return colors[status] || '#666'
  }

  return (
    <div className="list-page">
      <div className="page-header-navigation">
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          Retour au tableau de bord
        </button>
      </div>
      <h1>Emprunts</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      {success && <div className="success-message">{success}</div>}

      {loading && <p>Chargement...</p>}

      <div className="list-grid">
        {borrowings.length === 0 ? (
          <p className="empty-message">Aucun emprunt trouvé</p>
        ) : (
          borrowings.map((borrowing) => (
            <div key={borrowing.id} className="card">
              <div className="card-header">
                <h3>{borrowing.book?.title || 'Livre supprimé'}</h3>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(borrowing.status) }}
                >
                  {borrowing.status}
                </span>
              </div>
              <div className="card-body">
                <p>
                  <strong>Auteur:</strong> {borrowing.book?.author || 'N/A'}
                </p>
                <p>
                  <strong>Utilisateur:</strong> {borrowing.user?.firstName} {borrowing.user?.lastName}
                </p>
                <div className="borrowing-meta">
                  {borrowing.borrowDate && (
                    <p>
                      <strong>Date d'emprunt:</strong>{' '}
                      {new Date(borrowing.borrowDate).toLocaleDateString()}
                    </p>
                  )}
                  {borrowing.dueDate && (
                    <p>
                      <strong>Date d'échéance:</strong>{' '}
                      {new Date(borrowing.dueDate).toLocaleDateString()}
                    </p>
                  )}
                  {borrowing.returnDate && (
                    <p>
                      <strong>Date de retour:</strong>{' '}
                      {new Date(borrowing.returnDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="card-footer">
                {borrowing.status !== 'returned' && (
                  <button
                    onClick={() => handleReturnBook(borrowing.id)}
                    className="action-btn"
                  >
                    Retourner le livre
                  </button>
                )}
                <button className="action-btn secondary" onClick={() => handleShowDetails(borrowing)}>Détails</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Détails */}
      {selectedBorrowing && (
        <div className="modal-overlay" onClick={handleCloseDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Détails de l'emprunt</h2>
              <button className="modal-close" onClick={handleCloseDetails}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Livre</h3>
                <p><strong>Titre:</strong> {selectedBorrowing.book?.title || 'N/A'}</p>
                <p><strong>Auteur:</strong> {selectedBorrowing.book?.author || 'N/A'}</p>
                <p><strong>ISBN:</strong> {selectedBorrowing.book?.isbn || 'N/A'}</p>
                <p><strong>Catégorie:</strong> {selectedBorrowing.book?.category || 'N/A'}</p>
              </div>
              <div className="detail-section">
                <h3>Utilisateur</h3>
                <p><strong>Nom:</strong> {selectedBorrowing.user?.firstName} {selectedBorrowing.user?.lastName}</p>
                <p><strong>Email:</strong> {selectedBorrowing.user?.email}</p>
              </div>
              <div className="detail-section">
                <h3>Dates</h3>
                <p><strong>Date d'emprunt:</strong> {selectedBorrowing.borrowDate ? new Date(selectedBorrowing.borrowDate).toLocaleDateString() : 'N/A'}</p>
                <p><strong>Date d'échéance:</strong> {selectedBorrowing.dueDate ? new Date(selectedBorrowing.dueDate).toLocaleDateString() : 'N/A'}</p>
                {selectedBorrowing.returnDate && (
                  <p><strong>Date de retour:</strong> {new Date(selectedBorrowing.returnDate).toLocaleDateString()}</p>
                )}
              </div>
              <div className="detail-section">
                <h3>Statut</h3>
                <p style={{ fontSize: '16px', fontWeight: 'bold', color: getStatusColor(selectedBorrowing.status) }}>
                  {selectedBorrowing.status}
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={handleCloseDetails} className="action-btn primary">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
