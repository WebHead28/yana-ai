import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('yana-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('yana-token')
      localStorage.removeItem('yana-user-id')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
