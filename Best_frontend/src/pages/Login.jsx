import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
import ParticleBackground from '../components/ParticleBackground'
import YanaLogo from '../components/YanaLogo'
import LoadingScreen from '../components/LoadingScreen'

export default function Login() {
  const { theme } = useTheme()
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setLoadingText('Preparing your companion...')

    try {
      const data = await authService.login(form.username, form.password)
      // data: { access_token, user_id, personality_completed }
      login(data.access_token, { user_id: data.user_id })

      await new Promise((r) => setTimeout(r, 2000))

      if (!data.personality_completed) {
        navigate('/personality')
      } else {
        navigate('/chat')
      }
    } catch (err) {
      setLoading(false)
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.')
    }
  }

  if (loading) return <LoadingScreen text={loadingText} />

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
      <ParticleBackground count={35} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 420,
          padding: '0 24px',
        }}
      >
        {/* Logo + Brand */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div
              style={{
                position: 'relative',
                display: 'inline-flex',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: -20,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${theme.accentGlow} 0%, transparent 70%)`,
                  animation: 'breathe 4s ease-in-out infinite',
                }}
              />
              <YanaLogo size={64} />
            </div>
          </div>
          <h1
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '1.8rem',
              color: theme.accent,
              letterSpacing: '0.3em',
            }}
          >
            Y.A.N.A.
          </h1>
          <p style={{ color: theme.textMuted, fontSize: '0.85rem', marginTop: 6, letterSpacing: '0.1em' }}>
            Welcome back
          </p>
        </div>

        {/* Glass Card */}
        <div
          style={{
            background: theme.bgCard,
            backdropFilter: 'blur(20px)',
            borderRadius: 24,
            border: `1px solid ${theme.border}`,
            padding: '36px 32px',
            boxShadow: theme.shadow,
          }}
        >
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <InputField
                label="Username"
                type="text"
                value={form.username}
                onChange={(v) => setForm({ ...form, username: v })}
                theme={theme}
                placeholder="your_username"
              />

              <div style={{ position: 'relative' }}>
                <InputField
                  label="Password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(v) => setForm({ ...form, password: v })}
                  theme={theme}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute',
                    right: 14,
                    bottom: 12,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: theme.textMuted,
                    padding: 0,
                  }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    color: '#E07060',
                    fontSize: '0.85rem',
                    textAlign: 'center',
                    padding: '8px 12px',
                    background: 'rgba(224,112,96,0.1)',
                    borderRadius: 8,
                  }}
                >
                  {error}
                </motion.p>
              )}

              <GlowButton type="submit" theme={theme} disabled={!form.username || !form.password}>
                <LogIn size={18} />
                Sign In
              </GlowButton>
            </div>
          </form>

          <p
            style={{
              textAlign: 'center',
              marginTop: 24,
              fontSize: '0.85rem',
              color: theme.textMuted,
            }}
          >
            New here?{' '}
            <Link
              to="/register"
              style={{ color: theme.accent, textDecoration: 'none', fontWeight: 500 }}
            >
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

function InputField({ label, type, value, onChange, theme, placeholder }) {
  const [focused, setFocused] = useState(false)

  return (
    <div>
      <label
        style={{
          display: 'block',
          fontSize: '0.8rem',
          color: theme.textSecondary,
          marginBottom: 6,
          letterSpacing: '0.05em',
          fontWeight: 500,
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

function GlowButton({ children, onClick, type = 'button', disabled, theme, style = {} }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      type={type}
      onClick={onClick}
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
        background: disabled
          ? theme.border
          : hovered
          ? theme.accentHover
          : theme.accent,
        color: '#fff',
        fontSize: '0.95rem',
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.25s ease',
        boxShadow: hovered && !disabled ? `0 4px 24px ${theme.accentGlow}` : 'none',
        fontFamily: 'DM Sans, sans-serif',
        marginTop: 8,
        ...style,
      }}
    >
      {children}
    </button>
  )
}

export { InputField, GlowButton }
