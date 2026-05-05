import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { authService } from '../services/authService'
import { useAuth } from '../context/AuthContext'
import LoadingScreen from '../components/LoadingScreen'
import YanaLogo from '../components/YanaLogo'

const INTRO_LINES = [
  "Hi. I'm YANA.",
  'Not a chatbot.',
  'Not a search engine.',
  "I'm someone you can talk to.",
  'About your thoughts.',
  'Your worries.',
  'Your random 2AM ideas.',
  "I'll learn about you slowly",
  'and adapt to who you are.',
  'Think of me as a companion',
  'that listens.',
]

export default function Introduction() {
  const { theme } = useTheme()
  const { refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [phase, setPhase] = useState('intro') // intro | form
  const [lineIndex, setLineIndex] = useState(0)
  const [form, setForm] = useState({ name: '', nickname: '', age: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleNextLine = () => {
    if (lineIndex < INTRO_LINES.length - 1) {
      setLineIndex(lineIndex + 1)
    } else {
      setPhase('form')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name) {
      setError('Please enter your name.')
      return
    }
    setSubmitting(true)
    try {
      await authService.updateProfile({
        name: form.name,
        nickname: form.nickname || form.name,
        age: form.age ? parseInt(form.age) : null,
      })
      await refreshProfile()
      await new Promise((r) => setTimeout(r, 1500))
      navigate('/generating')
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  if (submitting) return <LoadingScreen text="Getting everything ready..." />

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.accentGlow} 0%, transparent 70%)`,
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 560, width: '100%', padding: '0 32px' }}>
        <AnimatePresence mode="wait">
          {phase === 'intro' ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ textAlign: 'center' }}
            >
              <div style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                  <div
                    style={{
                      position: 'relative',
                      display: 'inline-flex',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        inset: -30,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${theme.accentGlow} 0%, transparent 70%)`,
                        animation: 'breathe 4s ease-in-out infinite',
                      }}
                    />
                    <YanaLogo size={80} animate />
                  </div>
                </div>

                <motion.p
                  key={lineIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    fontFamily:
                      lineIndex === 0
                        ? 'Playfair Display, serif'
                        : 'DM Sans, sans-serif',
                    fontSize: lineIndex === 0 ? '2rem' : '1.3rem',
                    fontStyle: lineIndex === 0 ? 'italic' : 'normal',
                    color: lineIndex === 0 ? theme.accent : theme.text,
                    fontWeight: lineIndex === 0 ? 500 : 300,
                    lineHeight: 1.4,
                    marginBottom: 8,
                  }}
                >
                  {INTRO_LINES[lineIndex]}
                </motion.p>

                <p style={{ color: theme.textMuted, fontSize: '0.8rem', marginTop: 16 }}>
                  {lineIndex + 1} / {INTRO_LINES.length}
                </p>
              </div>

              <button
                onClick={handleNextLine}
                style={{
                  padding: '12px 36px',
                  borderRadius: 50,
                  border: `1.5px solid ${theme.accent}`,
                  background: 'transparent',
                  color: theme.accent,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'DM Sans, sans-serif',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = theme.accent
                  e.target.style.color = '#fff'
                  e.target.style.boxShadow = `0 4px 20px ${theme.accentGlow}`
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent'
                  e.target.style.color = theme.accent
                  e.target.style.boxShadow = 'none'
                }}
              >
                {lineIndex < INTRO_LINES.length - 1 ? 'Continue' : "Let's begin"}
                <ArrowRight size={16} />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <h2
                  style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: '1.7rem',
                    color: theme.accent,
                    marginBottom: 8,
                  }}
                >
                  Before we begin...
                </h2>
                <p style={{ color: theme.textMuted, fontSize: '0.9rem' }}>
                  Tell me a little about yourself
                </p>
              </div>

              <div
                style={{
                  background: theme.bgCard,
                  backdropFilter: 'blur(20px)',
                  borderRadius: 24,
                  border: `1px solid ${theme.border}`,
                  padding: '32px',
                  boxShadow: theme.shadow,
                }}
              >
                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <FormField
                      label="Your Name"
                      placeholder="What shall I call you?"
                      value={form.name}
                      onChange={(v) => setForm({ ...form, name: v })}
                      theme={theme}
                      required
                    />
                    <FormField
                      label="Nickname (optional)"
                      placeholder="A nickname you prefer?"
                      value={form.nickname}
                      onChange={(v) => setForm({ ...form, nickname: v })}
                      theme={theme}
                    />
                    <FormField
                      label="Age (optional)"
                      placeholder="How old are you?"
                      value={form.age}
                      onChange={(v) => setForm({ ...form, age: v })}
                      type="number"
                      theme={theme}
                    />

                    {error && (
                      <p style={{ color: '#E07060', fontSize: '0.85rem', textAlign: 'center' }}>
                        {error}
                      </p>
                    )}

                    <SubmitBtn theme={theme} disabled={!form.name}>
                      <ArrowRight size={18} />
                      Meet YANA
                    </SubmitBtn>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function FormField({ label, placeholder, value, onChange, theme, type = 'text', required }) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label
        style={{
          display: 'block',
          fontSize: '0.8rem',
          color: theme.textSecondary,
          marginBottom: 6,
          fontWeight: 500,
          letterSpacing: '0.05em',
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
        required={required}
        style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: 12,
          border: `1.5px solid ${focused ? theme.accent : theme.border}`,
          background: theme.inputBg,
          color: theme.text,
          fontSize: '0.95rem',
          outline: 'none',
          transition: 'all 0.25s ease',
          boxShadow: focused ? `0 0 0 3px ${theme.accentGlow}` : 'none',
          fontFamily: 'DM Sans, sans-serif',
        }}
      />
    </div>
  )
}

function SubmitBtn({ children, theme, disabled }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      type="submit"
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: '100%',
        padding: '13px 24px',
        borderRadius: 12,
        border: 'none',
        background: disabled ? theme.border : hovered ? theme.accentHover : theme.accent,
        color: disabled ? theme.textMuted : '#fff',
        fontSize: '0.95rem',
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.25s ease',
        boxShadow: hovered && !disabled ? `0 4px 24px ${theme.accentGlow}` : 'none',
        fontFamily: 'DM Sans, sans-serif',
        marginTop: 8,
      }}
    >
      {children}
    </button>
  )
}

function useState2(init) {
  return useState(init)
}
