import api from './api'

export const chatService = {
  getSessions: () =>
    api.get('/chat/sessions'),

  getMessages: (sessionId) =>
    api.get(`/chat/messages/${sessionId}`),

  renameSession: (session_id, new_title) =>
    api.put('/chat/rename', { session_id, new_title }),

  deleteSession: (sessionId) =>
    api.delete(`/chat/delete/${sessionId}`),

  // Returns a fetch Response for streaming
  sendMessage: async (message, session_id) => {
    const token = localStorage.getItem('yana-token')
    const baseURL = import.meta.env.VITE_API_URL || ''
    const response = await fetch(`${baseURL}/chat/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message, session_id: session_id || null }),
    })
    return response
  },
}
