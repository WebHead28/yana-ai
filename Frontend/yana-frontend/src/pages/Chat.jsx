import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { chatService } from '../services/chatService'
import { authService } from '../services/authService'
import Sidebar from '../components/Sidebar'
import ChatMessage from '../components/ChatMessage'
import MessageInput from '../components/MessageInput'
import ThemeToggle from '../components/ThemeToggle'

export default function Chat() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const [sessions, setSessions] = useState([])
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [streaming, setStreaming] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [profile, setProfile] = useState(null)
  const [profileEdit, setProfileEdit] = useState({})
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [loadingMessages, setLoadingMessages] = useState(false)

  const messagesEndRef = useRef(null)
  const streamingMsgRef = useRef('')

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchSessions = useCallback(async () => {
    try {
      const res = await chatService.getSessions()
      setSessions(res.data)
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async (sessionId) => {
    setLoadingMessages(true)
    try {
      const res = await chatService.getMessages(sessionId)
      if (Array.isArray(res.data)) {
        setMessages(res.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleSelectSession = (sessionId) => {
    setActiveSessionId(sessionId)
    loadMessages(sessionId)
  }

  const handleNewChat = () => {
    setActiveSessionId(null)
    setMessages([])
  }

  const handleSend = async (message) => {
    if (streaming) return

    const userMsg = { role: 'user', content: message }
    setMessages((prev) => [...prev, userMsg])
    setStreaming(true)
    streamingMsgRef.current = ''

    const placeholderMsg = { role: 'assistant', content: '' }
    setMessages((prev) => [...prev, placeholderMsg])

    try {
      const response = await chatService.sendMessage(message, activeSessionId)

      if (!response.ok) {
        throw new Error('Stream failed')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      let newSessionId = activeSessionId

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        streamingMsgRef.current += chunk

        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: 'assistant',
            content: streamingMsgRef.current,
          }
          return updated
        })
      }

      // If new session was created, refresh sessions and set active
      if (!activeSessionId) {
        const sessionsRes = await chatService.getSessions()
        setSessions(sessionsRes.data)
        if (sessionsRes.data.length > 0) {
          setActiveSessionId(sessionsRes.data[0].session_id)
        }
      }

    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Something went wrong. Please try again.',
        }
        return updated
      })
    } finally {
      setStreaming(false)
    }
  }

  const handleSignOut = () => {
    logout()
    navigate('/login')
  }

  const openProfile = async () => {
    setProfileError('')
    setProfileSuccess('')
    try {
      const res = await authService.getProfile()
      setProfile(res.data)
      setProfileEdit({
        name: res.data.name || '',
        nickname: res.data.nickname || '',
        age: res.data.age || '',
        email: res.data.email || '',
      })
    } catch (err) {
      console.error(err)
    }
    setShowProfile(true)
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileError('')
    setProfileSuccess('')
    try {
      await authService.updateProfile({
        name: profileEdit.name || undefined,
        nickname: profileEdit.nickname || undefined,
        age: profileEdit.age ? parseInt(profileEdit.age) : undefined,
        email: profileEdit.email || undefined,
      })
      setProfileSuccess('Profile updated successfully.')
      const res = await authService.getProfile()
      setProfile(res.data)
    } catch (err) {
      setProfileError(err.response?.data?.detail || 'Failed to update profile.')
    } finally {
      setProfileSaving(false)
    }
  }

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onSessionsChange={fetchSessions}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {activeSessionId
                ? sessions.find((s) => s.session_id === activeSessionId)?.title || 'Chat'
                : 'New Conversation'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={openProfile}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-1.5 border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
            >
              Profile
            </button>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors px-3 py-1.5 border border-gray-200 dark:border-gray-700 hover:border-red-300"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {loadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-gray-400 dark:text-gray-500">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-12 h-12 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center mb-4">
                <span className="text-white dark:text-gray-900 text-lg font-semibold">Y</span>
              </div>
              <h2 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-1">
                Hi, I'm YANA
              </h2>
              <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs">
                You are not alone. Start a conversation.
              </p>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              {messages.map((msg, i) => (
                <ChatMessage key={i} role={msg.role} content={msg.content} />
              ))}
              {streaming && messages[messages.length - 1]?.content === '' && (
                <div className="flex justify-start mb-4">
                  <div className="w-7 h-7 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center mr-2 flex-shrink-0">
                    <span className="text-white dark:text-gray-900 text-xs font-semibold">Y</span>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3">
                    <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="max-w-2xl w-full mx-auto w-full">
          <MessageInput onSend={handleSend} disabled={streaming} />
        </div>
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4"
          onClick={() => setShowProfile(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Your Profile</h2>
              <button
                onClick={() => setShowProfile(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {profile && (
              <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-0.5">Username</span>
                    <span className="text-gray-800 dark:text-gray-200 font-mono">{profile.username}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-0.5">Email</span>
                    <span className="text-gray-800 dark:text-gray-200 font-mono">{profile.email || '—'}</span>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleProfileSave} className="px-5 py-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Name</label>
                  <input
                    type="text"
                    value={profileEdit.name}
                    onChange={(e) => setProfileEdit((p) => ({ ...p, name: e.target.value }))}
                    className="input-field text-sm"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Nickname</label>
                  <input
                    type="text"
                    value={profileEdit.nickname}
                    onChange={(e) => setProfileEdit((p) => ({ ...p, nickname: e.target.value }))}
                    className="input-field text-sm"
                    placeholder="Nickname"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Age</label>
                  <input
                    type="number"
                    value={profileEdit.age}
                    onChange={(e) => setProfileEdit((p) => ({ ...p, age: e.target.value }))}
                    className="input-field text-sm"
                    placeholder="Age"
                    min="1"
                    max="120"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    value={profileEdit.email}
                    onChange={(e) => setProfileEdit((p) => ({ ...p, email: e.target.value }))}
                    className="input-field text-sm"
                    placeholder="Email"
                  />
                </div>
              </div>

              {profileError && <p className="text-xs text-red-500 dark:text-red-400">{profileError}</p>}
              {profileSuccess && <p className="text-xs text-green-600 dark:text-green-400">{profileSuccess}</p>}

              <button
                type="submit"
                disabled={profileSaving}
                className="btn-primary w-full py-2 text-sm mt-1"
              >
                {profileSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
