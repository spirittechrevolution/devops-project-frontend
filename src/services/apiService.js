import axios from 'axios'

// Configuration de base
const API_BASE_URL = '/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ==================== USER SERVICES ====================
export const userService = {
  register: (userData) => api.post('/users/register', userData),
  login: (credentials) => api.post('/users/login', credentials),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  changePassword: (passwordData) => api.post('/users/change-password', passwordData),
}

// ==================== BOOK SERVICES ====================
export const bookService = {
  createBook: (bookData) => api.post('/books', bookData),
  getAllBooks: (page = 1, limit = 10) => api.get(`/books?page=${page}&limit=${limit}`),
  searchBooks: (query) => api.get(`/books/search?q=${query}`),
  getBookById: (id) => api.get(`/books/${id}`),
  updateBook: (id, bookData) => api.put(`/books/${id}`, bookData),
  deleteBook: (id) => api.delete(`/books/${id}`),
}

// ==================== BORROWING SERVICES ====================
export const borrowingService = {
  borrowBook: (borrowData) => api.post('/borrowings/borrow', borrowData),
  returnBook: (borrowingId) => api.post(`/borrowings/${borrowingId}/return`),
  getAllBorrowings: () => api.get('/borrowings'),
  getUserBorrowings: () => api.get('/borrowings/user/borrowings'),
}

// ==================== HEALTH CHECK ====================
export const healthCheck = () => api.get('/health')

export default api
