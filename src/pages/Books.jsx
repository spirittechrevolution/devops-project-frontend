import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { bookService, borrowingService } from '../services/apiService'
import { Layout } from '../components/Layout'
import '../styles/list-page.css'
import '../styles/modal.css'

export const Books = () => {
  const { user } = useAuth()

  const [books, setBooks] = useState([])
  const [selectedBook, setSelectedBook] = useState(null)
  const [activeForm, setActiveForm] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [bookToDelete, setBookToDelete] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const isAdmin = user?.userType === 'admin'

  const [addFormData, setAddFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    description: '',
    category: '',
  })

  const [editFormData, setEditFormData] = useState({
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
      setError('Erreur lors du chargement des livres. Veuillez reessayer.')
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
      setError('')
    } catch (err) {
      setError('Erreur lors de la recherche. Veuillez reessayer.')
    } finally {
      setLoading(false)
    }
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    fetchBooks()
  }

  const handleAddBook = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await bookService.createBook(addFormData)
      setAddFormData({ title: '', author: '', isbn: '', description: '', category: '' })
      setActiveForm(null)
      setSuccess('Livre ajoute avec succes !')
      setTimeout(() => setSuccess(''), 3000)
      fetchBooks()
    } catch (err) {
      const status = err.response?.status
      if (status === 403) {
        setError('Acces refuse : seuls les administrateurs peuvent ajouter des livres')
      } else {
        const msg = err.response?.data?.message
        setError(msg || "Erreur lors de l'ajout du livre. Verifiez les champs et reessayez.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleOpenEdit = (book) => {
    setSelectedBook(book)
    setEditFormData({
      title: book.title || '',
      author: book.author || '',
      isbn: book.isbn || '',
      description: book.description || '',
      category: book.category || '',
    })
    setActiveForm('edit')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleUpdateBook = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await bookService.updateBook(selectedBook.id, editFormData)
      setActiveForm(null)
      setSelectedBook(null)
      setSuccess('Livre modifie avec succes !')
      setTimeout(() => setSuccess(''), 3000)
      fetchBooks()
    } catch (err) {
      const status = err.response?.status
      if (status === 403) {
        setError('Acces refuse : seuls les administrateurs peuvent modifier des livres')
      } else if (status === 404) {
        setError('Ce livre est introuvable')
      } else {
        setError('Erreur lors de la modification du livre. Veuillez reessayer.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDelete = (book) => {
    setBookToDelete(book)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    setLoading(true)
    try {
      await bookService.deleteBook(bookToDelete.id)
      setShowDeleteModal(false)
      setBookToDelete(null)
      setSuccess('Livre supprime avec succes !')
      setTimeout(() => setSuccess(''), 3000)
      fetchBooks()
    } catch (err) {
      const status = err.response?.status
      if (status === 403) {
        setError('Acces refuse : seuls les administrateurs peuvent supprimer des livres')
      } else if (status === 404) {
        setError('Ce livre est introuvable ou a deja ete supprime')
      } else {
        setError('Erreur lors de la suppression du livre. Veuillez reessayer.')
      }
      setShowDeleteModal(false)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteModal(false)
    setBookToDelete(null)
  }

  const handleBorrow = async (bookId) => {
    try {
      const today = new Date()
      const dueDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
      const dueDateString = dueDate.toISOString().split('T')[0]

      await borrowingService.borrowBook({ bookId, dueDate: dueDateString })
      setSuccess('Livre emprunte avec succes !')
      setTimeout(() => setSuccess(''), 3000)
      fetchBooks()
    } catch (err) {
      const status = err.response?.status
      const msg = err.response?.data?.message
      if (status === 400 && msg) {
        setError(msg)
      } else if (status === 403) {
        setError('Acces refuse : vous ne pouvez pas emprunter ce livre')
      } else {
        setError("Erreur lors de l'emprunt du livre. Veuillez reessayer.")
      }
      console.error(err)
    }
  }

  const handleCancelForm = () => {
    setActiveForm(null)
    setSelectedBook(null)
  }

  return (
    <Layout>

      <div className="page-header">
        <h1 className="page-title">Bibliotheque</h1>
        {isAdmin && (
          <button
            onClick={() => setActiveForm(activeForm === 'add' ? null : 'add')}
            className="add-btn"
          >
            {activeForm === 'add' ? 'Annuler' : '+ Ajouter un livre'}
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {activeForm === 'add' && (
        <div className="add-form">
          <h3>Ajouter un nouveau livre</h3>
          <form onSubmit={handleAddBook}>
            <div className="form-grid">
              <div className="form-group">
                <label>Titre *</label>
                <input
                  type="text"
                  value={addFormData.title}
                  onChange={(e) => setAddFormData({ ...addFormData, title: e.target.value })}
                  placeholder="Titre du livre"
                  required
                />
              </div>
              <div className="form-group">
                <label>Auteur *</label>
                <input
                  type="text"
                  value={addFormData.author}
                  onChange={(e) => setAddFormData({ ...addFormData, author: e.target.value })}
                  placeholder="Nom de l'auteur"
                  required
                />
              </div>
              <div className="form-group">
                <label>ISBN *</label>
                <input
                  type="text"
                  value={addFormData.isbn}
                  onChange={(e) => setAddFormData({ ...addFormData, isbn: e.target.value })}
                  placeholder="Ex: 978-3-16-148410-0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Categorie</label>
                <input
                  type="text"
                  value={addFormData.category}
                  onChange={(e) => setAddFormData({ ...addFormData, category: e.target.value })}
                  placeholder="Ex: Informatique, Litterature..."
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={addFormData.description}
                  onChange={(e) => setAddFormData({ ...addFormData, description: e.target.value })}
                  placeholder="Description du livre"
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="save-btn" disabled={loading}>
                {loading ? 'Ajout en cours...' : 'Ajouter le livre'}
              </button>
              <button type="button" className="cancel-btn" onClick={handleCancelForm}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {activeForm === 'edit' && selectedBook && (
        <div className="add-form">
          <h3>Modifier : {selectedBook.title}</h3>
          <form onSubmit={handleUpdateBook}>
            <div className="form-grid">
              <div className="form-group">
                <label>Titre *</label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Auteur *</label>
                <input
                  type="text"
                  value={editFormData.author}
                  onChange={(e) => setEditFormData({ ...editFormData, author: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>ISBN *</label>
                <input
                  type="text"
                  value={editFormData.isbn}
                  onChange={(e) => setEditFormData({ ...editFormData, isbn: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Categorie</label>
                <input
                  type="text"
                  value={editFormData.category}
                  onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, description: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="save-btn" disabled={loading}>
                {loading ? 'Modification en cours...' : 'Enregistrer les modifications'}
              </button>
              <button type="button" className="cancel-btn" onClick={handleCancelForm}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Rechercher par titre, auteur ou ISBN..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit">Rechercher</button>
        {searchQuery && (
          <button type="button" className="clear-search" onClick={handleClearSearch}>
            Effacer
          </button>
        )}
      </form>

      {loading && <p className="loading">Chargement...</p>}

      <div className="list-grid">
        {!loading && books.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📚</div>
            <h3>Aucun livre trouve</h3>
            {isAdmin && <p>Ajoutez votre premier livre en cliquant sur le bouton ci-dessus.</p>}
          </div>
        ) : (
          books.map((book) => (
            <div key={book.id} className="card">
              <div className="card-header">
                <h3>{book.title}</h3>
              </div>
              <div className="card-body">
                <p><strong>Auteur :</strong> {book.author}</p>
                <p><strong>ISBN :</strong> {book.isbn}</p>
                <p><strong>Categorie :</strong> {book.category || 'Non definie'}</p>
                {book.description && (
                  <p><strong>Description :</strong> {book.description}</p>
                )}
              </div>
              <div className="card-footer">
                <button onClick={() => handleBorrow(book.id)} className="action-btn primary">
                  Emprunter
                </button>
                {isAdmin && (
                  <>
                    <button onClick={() => handleOpenEdit(book)} className="action-btn secondary">
                      Modifier
                    </button>
                    <button onClick={() => handleOpenDelete(book)} className="action-btn danger">
                      Supprimer
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showDeleteModal && bookToDelete && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmer la suppression</h2>
              <button className="modal-close" onClick={handleCancelDelete}>X</button>
            </div>
            <div className="modal-body">
              <p>
                Etes-vous sur de vouloir supprimer{' '}
                <strong>{bookToDelete.title}</strong> ?
              </p>
              <p>Cette action est irreversible.</p>
            </div>
            <div className="modal-footer">
              <button
                onClick={handleConfirmDelete}
                className="action-btn danger"
                disabled={loading}
              >
                {loading ? 'Suppression...' : 'Oui, supprimer'}
              </button>
              <button onClick={handleCancelDelete} className="action-btn secondary">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  )
}