import api from './api'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const chatService = {
  getSessions: async () => {
    const res = await api.get('/chat/sessions')
    return res.data
    // Returns: [{ session_id, title, created_at }]
  },

  getMessages: async (sessionId) => {
    const res = await api.get(`/chat/messages/${sessionId}`)
    return res.data
    // Returns: [{ role, content, created_at }]
  },

  renameSession: async (sessionId, newTitle) => {
    const res = await api.put('/chat/rename', {
      session_id: sessionId,
      new_title: newTitle,
    })
    return res.data
  },

  deleteSession: async (sessionId) => {
    const res = await api.delete(`/chat/delete/${sessionId}`)
    return res.data
  },

  streamChat: async (message, sessionId, onToken, onDone, onError) => {
    const token = localStorage.getItem('yana_token')
    try {
      const response = await fetch(`${BASE_URL}/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message,
          session_id: sessionId || null,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk
        onToken(chunk, fullText)
      }

      onDone(fullText)
    } catch (err) {
      onError(err)
    }
  },
}
