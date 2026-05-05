import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit3,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Send,
  Copy,
  RefreshCw,
  User,
  Palette,
  LogOut,
  ChevronDown,
  CheckCheck,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { chatService } from '../services/chatService'
import YanaLogo from '../components/YanaLogo'
import ThemeSwitcher from '../components/ThemeSwitcher'
import UpdateProfileModal from '../components/UpdateProfileModal'

export default function Chat() {
  const { theme } = useTheme()
  const { user, logout, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [sessions, setSessions] = useState([])
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [deleteModal, setDeleteModal] = useState(null) // session to delete
  const [themeModal, setThemeModal] = useState(false)
  const [profileModal, setProfileModal] = useState(false)
  const [renamingId, setRenamingId] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [copiedId, setCopiedId] = useState(null)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const profileMenuRef = useRef(null)

  // Load sessions
  useEffect(() => {
    loadSessions()
  }, [])

  // Close profile menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  // Auto-resize textarea
  const handleInputChange = (e) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
  }

  const loadSessions = async () => {
    try {
      const data = await chatService.getSessions()
      setSessions(data)
    } catch (err) {
      console.error(err)
    }
  }

  const loadMessages = async (sessionId) => {
    try {
      const data = await chatService.getMessages(sessionId)
      setMessages(data.filter(m => !m.error))
    } catch (err) {
      console.error(err)
    }
  }

  const selectSession = async (sessionId) => {
    setActiveSessionId(sessionId)
    setMessages([])
    await loadMessages(sessionId)
  }

  const newChat = () => {
    setActiveSessionId(null)
    setMessages([])
    inputRef.current?.focus()
  }

  const sendMessage = async () => {
    if (!input.trim() || streaming) return
    const userMsg = input.trim()
    setInput('')
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }

    // Optimistically add user message
    const optimisticUser = { role: 'user', content: userMsg, created_at: new Date().toISOString() }
    setMessages((prev) => [...prev, optimisticUser])

    setStreaming(true)
    setStreamingText('')

    let finalSessionId = activeSessionId
    let fullReply = ''

    chatService.streamChat(
      userMsg,
      activeSessionId,
      (chunk, accumulated) => {
        setStreamingText(accumulated)
        fullReply = accumulated
      },
      async (fullText) => {
        setStreaming(false)
        setStreamingText('')

        const aiMsg = { role: 'assistant', content: fullText, created_at: new Date().toISOString() }
        setMessages((prev) => [...prev, aiMsg])

        // Reload sessions to get new session or updated title
        await loadSessions()

        // If no active session, pick the newest one
        if (!finalSessionId) {
          const updated = await chatService.getSessions()
          setSessions(updated)
          if (updated.length > 0) {
            setActiveSessionId(updated[0].session_id)
          }
        }
      },
      (err) => {
        console.error(err)
        setStreaming(false)
        setStreamingText('')
      }
    )
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const copyMessage = async (content, id) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const regenerateMessage = async () => {
    if (messages.length < 2) return
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    if (!lastUser) return

    // Remove last AI message
    setMessages((prev) => prev.filter((_, i) => i !== prev.length - 1))
    setStreaming(true)
    setStreamingText('')

    chatService.streamChat(
      lastUser.content,
      activeSessionId,
      (chunk, acc) => setStreamingText(acc),
      (fullText) => {
        setStreaming(false)
        setStreamingText('')
        setMessages((prev) => [...prev, { role: 'assistant', content: fullText, created_at: new Date().toISOString() }])
      },
      (err) => {
        console.error(err)
        setStreaming(false)
        setStreamingText('')
      }
    )
  }

  const startRename = (session) => {
    setRenamingId(session.session_id)
    setRenameValue(session.title)
  }

  const submitRename = async (sessionId) => {
    if (!renameValue.trim()) return
    try {
      await chatService.renameSession(sessionId, renameValue.trim())
      await loadSessions()
    } catch (err) { console.error(err) }
    setRenamingId(null)
  }

  const confirmDelete = async (sessionId) => {
    try {
      await chatService.deleteSession(sessionId)
      if (activeSessionId === sessionId) {
        setActiveSessionId(null)
        setMessages([])
      }
      await loadSessions()
    } catch (err) { console.error(err) }
    setDeleteModal(null)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', overflow: 'hidden' }}>
      {/* SIDEBAR */}
      <motion.div
        animate={{ width: sidebarOpen ? 260 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{
          flexShrink: 0,
          overflow: 'hidden',
          background: theme.bgSidebar,
          backdropFilter: 'blur(20px)',
          borderRight: `1px solid ${theme.border}`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ width: 260, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Sidebar header */}
          <div
            style={{
              padding: '20px 16px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              borderBottom: `1px solid ${theme.border}`,
              flexShrink: 0,
            }}
          >
            <YanaLogo size={32} />
            <span
              style={{
                fontFamily: 'Playfair Display, serif',
                color: theme.accent,
                fontSize: '1.1rem',
                letterSpacing: '0.15em',
              }}
            >
              Y.A.N.A.
            </span>
          </div>

          {/* New chat button */}
          <div style={{ padding: '12px 12px 8px', flexShrink: 0 }}>
            <button
              onClick={newChat}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 10,
                border: `1px dashed ${theme.borderStrong}`,
                background: 'transparent',
                color: theme.accent,
                cursor: 'pointer',
                fontSize: '0.88rem',
                fontFamily: 'DM Sans, sans-serif',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.accentGlow
                e.currentTarget.style.borderStyle = 'solid'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderStyle = 'dashed'
              }}
            >
              <Plus size={16} />
              New Chat
            </button>
          </div>

          {/* Sessions list */}
          <div style={{ flex: 1, overflow: 'auto', padding: '4px 8px' }}>
            <p
              style={{
                fontSize: '0.7rem',
                color: theme.textMuted,
                letterSpacing: '0.1em',
                padding: '8px 8px 4px',
                fontWeight: 500,
              }}
            >
              RECENT CHATS
            </p>

            {sessions.length === 0 && (
              <p style={{ color: theme.textMuted, fontSize: '0.82rem', padding: '12px 8px' }}>
                No chats yet. Start a conversation!
              </p>
            )}

            {sessions.map((session) => (
              <SessionItem
                key={session.session_id}
                session={session}
                active={activeSessionId === session.session_id}
                renaming={renamingId === session.session_id}
                renameValue={renameValue}
                onSelect={() => selectSession(session.session_id)}
                onStartRename={() => startRename(session)}
                onRenameChange={setRenameValue}
                onSubmitRename={() => submitRename(session.session_id)}
                onCancelRename={() => setRenamingId(null)}
                onDelete={() => setDeleteModal(session)}
                theme={theme}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* MAIN AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* TOP BAR */}
        <div
          style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            borderBottom: `1px solid ${theme.border}`,
            background: theme.bgCard,
            backdropFilter: 'blur(10px)',
            flexShrink: 0,
            gap: 12,
          }}
        >
          {/* Toggle sidebar */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: `1px solid ${theme.border}`,
              background: 'transparent',
              color: theme.textSecondary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>

          {/* Chat title */}
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontFamily: 'Playfair Display, serif',
                color: theme.text,
                fontSize: '0.95rem',
              }}
            >
              {activeSessionId
                ? sessions.find((s) => s.session_id === activeSessionId)?.title || 'Chat'
                : 'New Conversation'}
            </p>
          </div>

          {/* Profile menu */}
          <div ref={profileMenuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: `2px solid ${theme.accent}`,
                background: theme.accentGlow,
                color: theme.accent,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                boxShadow: profileMenuOpen ? `0 0 12px ${theme.accentGlow}` : 'none',
              }}
            >
              <User size={16} />
            </button>

            <AnimatePresence>
              {profileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -8 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute',
                    top: 44,
                    right: 0,
                    background: theme.bgCard,
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${theme.border}`,
                    borderRadius: 14,
                    padding: 8,
                    minWidth: 180,
                    boxShadow: theme.shadow,
                    zIndex: 100,
                  }}
                >
                  {user && (
                    <div
                      style={{
                        padding: '8px 12px 10px',
                        borderBottom: `1px solid ${theme.border}`,
                        marginBottom: 4,
                      }}
                    >
                      <p style={{ fontSize: '0.8rem', color: theme.textMuted }}>Signed in as</p>
                      <p style={{ fontSize: '0.9rem', color: theme.text, fontWeight: 500 }}>
                        {user.name || user.nickname || user.username || 'User'}
                      </p>
                    </div>
                  )}
                  <ProfileMenuItem
                    icon={<User size={15} />}
                    label="Update Profile"
                    onClick={() => { setProfileModal(true); setProfileMenuOpen(false) }}
                    theme={theme}
                  />
                  <ProfileMenuItem
                    icon={<Palette size={15} />}
                    label="Select Theme"
                    onClick={() => { setThemeModal(true); setProfileMenuOpen(false) }}
                    theme={theme}
                  />
                  <ProfileMenuItem
                    icon={<LogOut size={15} />}
                    label="Sign Out"
                    onClick={handleLogout}
                    theme={theme}
                    danger
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* MESSAGES AREA */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '24px 0',
          }}
        >
          {messages.length === 0 && !streaming ? (
            <EmptyState theme={theme} />
          ) : (
            <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px' }}>
              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <ChatBubble
                    key={idx}
                    message={msg}
                    theme={theme}
                    onCopy={() => copyMessage(msg.content, idx)}
                    onRegenerate={msg.role === 'assistant' && idx === messages.length - 1 ? regenerateMessage : null}
                    copied={copiedId === idx}
                  />
                ))}
              </AnimatePresence>

              {/* Streaming bubble */}
              {streaming && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <StreamingBubble text={streamingText} theme={theme} />
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* INPUT BAR */}
        <div
          style={{
            padding: '12px 24px 16px',
            borderTop: `1px solid ${theme.border}`,
            background: theme.bgCard,
            backdropFilter: 'blur(10px)',
            flexShrink: 0,
          }}
        >
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <InputBar
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onSend={sendMessage}
              disabled={streaming}
              theme={theme}
              inputRef={inputRef}
            />
          </div>
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {deleteModal && (
          <DeleteModal
            session={deleteModal}
            theme={theme}
            onConfirm={() => confirmDelete(deleteModal.session_id)}
            onCancel={() => setDeleteModal(null)}
          />
        )}
        {themeModal && (
          <ThemeSwitcher onClose={() => setThemeModal(false)} />
        )}
        {profileModal && (
          <UpdateProfileModal
            theme={theme}
            onClose={() => setProfileModal(false)}
            onSaved={refreshProfile}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function EmptyState({ theme }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 16,
      }}
    >
      <div style={{ position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            inset: -30,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${theme.accentGlow} 0%, transparent 70%)`,
            animation: 'breathe 4s ease-in-out infinite',
          }}
        />
        <YanaLogo size={64} animate />
      </div>
      <p
        style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '1.2rem',
          color: theme.textSecondary,
          textAlign: 'center',
          fontStyle: 'italic',
        }}
      >
        What's on your mind? Spill the beans.
      </p>
      <p style={{ color: theme.textMuted, fontSize: '0.85rem', textAlign: 'center' }}>
        I'm here, whenever you're ready.
      </p>
    </div>
  )
}

function ChatBubble({ message, theme, onCopy, onRegenerate, copied }) {
  const [showActions, setShowActions] = useState(false)
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 16,
        position: 'relative',
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!isUser && (
        <div style={{ marginRight: 10, flexShrink: 0, marginTop: 2 }}>
          <YanaLogo size={28} />
        </div>
      )}

      <div style={{ maxWidth: '75%', position: 'relative' }}>
        <div
          style={{
            padding: '12px 16px',
            borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
            background: isUser ? theme.bgBubbleUser : theme.bgBubbleAI,
            color: isUser ? '#fff' : theme.text,
            fontSize: '0.93rem',
            lineHeight: 1.65,
            fontFamily: 'DM Sans, sans-serif',
            boxShadow: isUser ? `0 4px 16px ${theme.accentGlow}` : theme.shadow,
            border: isUser ? 'none' : `1px solid ${theme.border}`,
            backdropFilter: isUser ? 'none' : 'blur(8px)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {message.content}
        </div>

        {/* Actions */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                position: 'absolute',
                bottom: -32,
                right: isUser ? 0 : 'auto',
                left: isUser ? 'auto' : 0,
                display: 'flex',
                gap: 4,
                background: theme.bgCard,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${theme.border}`,
                borderRadius: 8,
                padding: '4px 6px',
                zIndex: 10,
              }}
            >
              <ActionBtn onClick={onCopy} title={copied ? 'Copied!' : 'Copy'} theme={theme}>
                {copied ? <CheckCheck size={13} /> : <Copy size={13} />}
              </ActionBtn>
              {onRegenerate && (
                <ActionBtn onClick={onRegenerate} title="Regenerate" theme={theme}>
                  <RefreshCw size={13} />
                </ActionBtn>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isUser && (
        <div
          style={{
            marginLeft: 10,
            flexShrink: 0,
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: theme.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 2,
          }}
        >
          <User size={14} color="#fff" />
        </div>
      )}
    </motion.div>
  )
}

function StreamingBubble({ text, theme }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        marginBottom: 16,
      }}
    >
      <div style={{ marginRight: 10, flexShrink: 0, marginTop: 2 }}>
        <YanaLogo size={28} />
      </div>
      <div
        style={{
          maxWidth: '75%',
          padding: '12px 16px',
          borderRadius: '20px 20px 20px 4px',
          background: theme.bgBubbleAI,
          color: theme.text,
          fontSize: '0.93rem',
          lineHeight: 1.65,
          fontFamily: 'DM Sans, sans-serif',
          boxShadow: theme.shadow,
          border: `1px solid ${theme.border}`,
          backdropFilter: 'blur(8px)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {text || (
          <div style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '2px 0' }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`dot-${i + 1}`}
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: theme.textMuted,
                }}
              />
            ))}
          </div>
        )}
        {text && <span className="typing-cursor" style={{ color: theme.accent }} />}
      </div>
    </div>
  )
}

function InputBar({ value, onChange, onKeyDown, onSend, disabled, theme, inputRef }) {
  const [focused, setFocused] = useState(false)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 10,
        background: theme.inputBg,
        border: `1.5px solid ${focused ? theme.accent : theme.border}`,
        borderRadius: 16,
        padding: '10px 14px',
        transition: 'all 0.25s ease',
        boxShadow: focused ? `0 0 0 3px ${theme.accentGlow}` : 'none',
      }}
    >
      <textarea
        ref={inputRef}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Type something..."
        rows={1}
        disabled={disabled}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: theme.text,
          fontSize: '0.93rem',
          fontFamily: 'DM Sans, sans-serif',
          lineHeight: 1.5,
          maxHeight: 160,
          overflow: 'auto',
          resize: 'none',
        }}
      />
      <button
        onClick={onSend}
        disabled={disabled || !value.trim()}
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          border: 'none',
          background: disabled || !value.trim() ? theme.border : theme.accent,
          color: '#fff',
          cursor: disabled || !value.trim() ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          flexShrink: 0,
          boxShadow: !disabled && value.trim() ? `0 2px 12px ${theme.accentGlow}` : 'none',
        }}
      >
        <Send size={16} />
      </button>
    </div>
  )
}

function SessionItem({ session, active, renaming, renameValue, onSelect, onStartRename, onRenameChange, onSubmitRename, onCancelRename, onDelete, theme }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 10,
        marginBottom: 2,
        background: active ? theme.accentGlow : hovered ? `${theme.accentGlow}60` : 'transparent',
        border: active ? `1px solid ${theme.borderStrong}` : '1px solid transparent',
        transition: 'all 0.15s ease',
        overflow: 'hidden',
      }}
    >
      {renaming ? (
        <div style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            value={renameValue}
            onChange={(e) => onRenameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSubmitRename()
              if (e.key === 'Escape') onCancelRename()
            }}
            autoFocus
            style={{
              flex: 1,
              background: 'transparent',
              border: `1px solid ${theme.accent}`,
              borderRadius: 6,
              padding: '4px 8px',
              color: theme.text,
              fontSize: '0.82rem',
              outline: 'none',
              fontFamily: 'DM Sans, sans-serif',
            }}
          />
          <button onClick={onSubmitRename} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.accent, padding: 2 }}>
            <Check size={14} />
          </button>
          <button onClick={onCancelRename} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textMuted, padding: 2 }}>
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          style={{
            padding: '9px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
          }}
          onClick={onSelect}
        >
          <MessageSquare size={14} style={{ color: active ? theme.accent : theme.textMuted, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                color: active ? theme.accent : theme.text,
                fontSize: '0.83rem',
                fontWeight: active ? 500 : 400,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {session.title || 'New Chat'}
            </p>
          </div>

          {(hovered || active) && (
            <div
              style={{ display: 'flex', gap: 2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onStartRename}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 5,
                  border: 'none',
                  background: 'transparent',
                  color: theme.textMuted,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Rename"
              >
                <Edit3 size={12} />
              </button>
              <button
                onClick={onDelete}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 5,
                  border: 'none',
                  background: 'transparent',
                  color: '#E07060',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Delete"
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ActionBtn({ children, onClick, title, theme }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 26,
        height: 26,
        borderRadius: 6,
        border: 'none',
        background: hovered ? theme.accentGlow : 'transparent',
        color: theme.textSecondary,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s ease',
      }}
    >
      {children}
    </button>
  )
}

function ProfileMenuItem({ icon, label, onClick, theme, danger }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 12px',
        borderRadius: 8,
        border: 'none',
        background: hovered ? (danger ? 'rgba(224,112,96,0.1)' : theme.accentGlow) : 'transparent',
        color: danger ? '#E07060' : theme.text,
        cursor: 'pointer',
        fontSize: '0.88rem',
        fontFamily: 'DM Sans, sans-serif',
        textAlign: 'left',
        transition: 'all 0.15s ease',
      }}
    >
      {icon}
      {label}
    </button>
  )
}

function DeleteModal({ session, theme, onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        backdropFilter: 'blur(4px)',
      }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: theme.bgCard,
          backdropFilter: 'blur(20px)',
          borderRadius: 20,
          border: `1px solid ${theme.border}`,
          padding: '28px 32px',
          maxWidth: 380,
          width: '90%',
          boxShadow: theme.shadow,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'rgba(224,112,96,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Trash2 size={22} color="#E07060" />
          </div>
          <h3
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '1.2rem',
              color: theme.text,
              marginBottom: 8,
            }}
          >
            Delete Chat?
          </h3>
          <p style={{ color: theme.textMuted, fontSize: '0.88rem', lineHeight: 1.5 }}>
            "{session.title}" will be permanently deleted. This can't be undone.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '11px 0',
              borderRadius: 10,
              border: `1px solid ${theme.border}`,
              background: 'transparent',
              color: theme.text,
              cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.9rem',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '11px 0',
              borderRadius: 10,
              border: 'none',
              background: '#E07060',
              color: '#fff',
              cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
