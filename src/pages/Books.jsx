import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookService, borrowingService } from '../services/apiService'
import '../styles/list-page.css'

export const Books = () => {
  const navigate = useNavigate()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    description: '',
    category: '',
  })

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    setLoading(true)
    try {
      const response = await bookService.getAllBooks()
      setBooks(response.data.data || [])
      setError('')
    } catch (err) {
      setError('Erreur lors du chargement des livres')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      fetchBooks()
      return
    }

    setLoading(true)
    try {
      const response = await bookService.searchBooks(searchQuery)
      setBooks(response.data.data || [])
    } catch (err) {
      setError('Erreur lors de la recherche')
    } finally {
      setLoading(false)
    }
  }

  const handleAddBook = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await bookService.createBook(formData)
      setFormData({ title: '', author: '', isbn: '', description: '', category: '' })
      setShowForm(false)
      setSuccess('Livre ajouté avec succès!')
      setTimeout(() => setSuccess(''), 3000)
      fetchBooks()
    } catch (err) {
      setError('Erreur lors de l\'ajout du livre')
    } finally {
      setLoading(false)
    }
  }

  const handleBorrow = async (bookId) => {
    try {
      // Calculer la date de retour (30 jours après aujourd'hui)
      const today = new Date()
      const dueDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
      const dueDateString = dueDate.toISOString().split('T')[0]

      await borrowingService.borrowBook({ 
        bookId,
        dueDate: dueDateString
      })
      setSuccess('Livre emprunté avec succès!')
      setTimeout(() => setSuccess(''), 3000)
      fetchBooks()
    } catch (err) {
      setError('Erreur lors de l\'emprunt du livre')
      console.error(err)
    }
  }

  return (
    <div className="list-page">
      <div className="page-header-navigation">
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          Retour au tableau de bord
        </button>
      </div>
      <h1>Bibliothèque</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="page-controls">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Rechercher un livre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">Rechercher</button>
        </form>

        <button onClick={() => setShowForm(!showForm)} className="add-btn">
          {showForm ? '✕ Annuler' : '+ Ajouter un livre'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddBook} className="add-form">
          <h3>Ajouter un nouveau livre</h3>

          <div className="form-group">
            <label>Titre *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Auteur *</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>ISBN *</label>
            <input
              type="text"
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Catégorie</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Ajout en cours...' : 'Ajouter le livre'}
          </button>
        </form>
      )}

      {loading && <p>Chargement...</p>}

      <div className="list-grid">
        {books.length === 0 ? (
          <p className="empty-message">Aucun livre trouvé</p>
        ) : (
          books.map((book) => (
            <div key={book.id} className="card">
              <div className="card-header">
                <h3>{book.title}</h3>
              </div>
              <div className="card-body">
                <p>
                  <strong>Auteur:</strong> {book.author}
                </p>
                <p>
                  <strong>ISBN:</strong> {book.isbn}
                </p>
                <p>
                  <strong>Catégorie:</strong> {book.category || 'N/A'}
                </p>
                <p className="description">{book.description}</p>
              </div>
              <div className="card-footer">
                <button onClick={() => handleBorrow(book.id)} className="action-btn primary">Emprunter</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
