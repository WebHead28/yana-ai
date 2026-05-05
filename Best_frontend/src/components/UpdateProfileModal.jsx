import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Save } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'

export default function UpdateProfileModal({ theme, onClose, onSaved }) {
  const { user } = useAuth()
  const [form, setForm] = useState({ name: '', nickname: '', age: '', email: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        nickname: user.nickname || '',
        age: user.age ? String(user.age) : '',
        email: user.email || '',
      })
    }
  }, [user])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await authService.updateProfile({
        name: form.name || undefined,
        nickname: form.nickname || undefined,
        age: form.age ? parseInt(form.age) : undefined,
        email: form.email || undefined,
      })
      await onSaved()
      setSaved(true)
      setTimeout(() => {
        onClose()
        setSaved(false)
      }, 1200)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

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
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: theme.bgCard,
          backdropFilter: 'blur(24px)',
          borderRadius: 24,
          border: `1px solid ${theme.border}`,
          padding: '28px',
          maxWidth: 400,
          width: '90%',
          boxShadow: theme.shadow,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}
        >
          <h3
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '1.2rem',
              color: theme.text,
            }}
          >
            Update Profile
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: theme.textMuted,
              display: 'flex',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { key: 'name', label: 'Name', type: 'text', placeholder: 'Your name' },
              { key: 'nickname', label: 'Nickname', type: 'text', placeholder: 'A nickname' },
              { key: 'age', label: 'Age', type: 'number', placeholder: 'Your age' },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'Your email' },
            ].map(({ key, label, type, placeholder }) => (
              <ProfileField
                key={key}
                label={label}
                type={type}
                value={form[key]}
                onChange={(v) => setForm({ ...form, [key]: v })}
                theme={theme}
                placeholder={placeholder}
              />
            ))}

            {error && (
              <p style={{ color: '#E07060', fontSize: '0.85rem', textAlign: 'center' }}>{error}</p>
            )}

            <SaveBtn theme={theme} saving={saving} saved={saved}>
              {saved ? 'Saved!' : saving ? 'Saving...' : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </SaveBtn>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

function ProfileField({ label, type, value, onChange, theme, placeholder }) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label
        style={{
          display: 'block',
          fontSize: '0.78rem',
          color: theme.textSecondary,
          marginBottom: 5,
          fontWeight: 500,
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px 14px',
          borderRadius: 10,
          border: `1.5px solid ${focused ? theme.accent : theme.border}`,
          background: theme.inputBg,
          color: theme.text,
          fontSize: '0.9rem',
          outline: 'none',
          transition: 'all 0.2s ease',
          boxShadow: focused ? `0 0 0 3px ${theme.accentGlow}` : 'none',
          fontFamily: 'DM Sans, sans-serif',
        }}
      />
    </div>
  )
}

function SaveBtn({ children, theme, saving, saved }) {
  const [hovered, setHovered] = useState(false)
  const bg = saved ? '#5DAA6E' : saving ? theme.border : hovered ? theme.accentHover : theme.accent

  return (
    <button
      type="submit"
      disabled={saving}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: '100%',
        padding: '12px 0',
        borderRadius: 10,
        border: 'none',
        background: bg,
        color: '#fff',
        fontSize: '0.9rem',
        fontWeight: 500,
        cursor: saving ? 'not-allowed' : 'pointer',
        transition: 'all 0.25s ease',
        boxShadow: hovered && !saving ? `0 4px 20px ${theme.accentGlow}` : 'none',
        fontFamily: 'DM Sans, sans-serif',
        marginTop: 4,
      }}
    >
      {children}
    </button>
  )
}
