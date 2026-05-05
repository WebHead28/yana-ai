import { useState } from 'react'
import { chatService } from '../services/chatService'

export default function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onSessionsChange,
}) {
  const [renamingId, setRenamingId] = useState(null)
  const [renameValue, setRenameValue] = useState('')

  const startRename = (e, session) => {
    e.stopPropagation()
    setRenamingId(session.session_id)
    setRenameValue(session.title)
  }

  const submitRename = async (sessionId) => {
    if (!renameValue.trim()) return
    try {
      await chatService.renameSession(sessionId, renameValue.trim())
      onSessionsChange()
    } catch (err) {
      console.error(err)
    }
    setRenamingId(null)
  }

  const handleDelete = async (e, sessionId) => {
    e.stopPropagation()
    if (!confirm('Delete this conversation?')) return
    try {
      await chatService.deleteSession(sessionId)
      onSessionsChange()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-500">YANA</span>
        </div>
        <button
          onClick={onNewChat}
          className="w-full btn-primary text-center py-2"
        >
          + New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {sessions.length === 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 px-4 py-3">No conversations yet.</p>
        )}
        {sessions.map((session) => (
          <div
            key={session.session_id}
            onClick={() => onSelectSession(session.session_id)}
            className={`group relative flex items-center gap-2 px-4 py-2.5 cursor-pointer transition-colors ${
              activeSessionId === session.session_id
                ? 'bg-gray-100 dark:bg-gray-800'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {renamingId === session.session_id ? (
              <input
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={() => submitRename(session.session_id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitRename(session.session_id)
                  if (e.key === 'Escape') setRenamingId(null)
                }}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 text-xs bg-transparent border-b border-gray-400 dark:border-gray-500 outline-none text-gray-800 dark:text-gray-200"
              />
            ) : (
              <span className="flex-1 text-xs text-gray-700 dark:text-gray-300 truncate">
                {session.title || 'Untitled'}
              </span>
            )}

            <div className="hidden group-hover:flex items-center gap-1">
              <button
                onClick={(e) => startRename(e, session)}
                className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                title="Rename"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button
                onClick={(e) => handleDelete(e, session.session_id)}
                className="p-0.5 text-gray-400 hover:text-red-500"
                title="Delete"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
