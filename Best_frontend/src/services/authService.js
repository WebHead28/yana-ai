import api from './api'

export const authService = {
  register: async (username, email, password) => {
    const res = await api.post('/auth/register', { username, email, password })
    return res.data
  },

  login: async (username, password) => {
    const res = await api.post('/auth/login', { username, password })
    return res.data
    // Returns: { access_token, user_id, personality_completed }
  },

  getProfile: async () => {
    const res = await api.get('/auth/profile')
    return res.data
  },

  updateProfile: async (data) => {
    // data: { name?, nickname?, age?, email? }
    const res = await api.put('/auth/profile', data)
    return res.data
  },
}
