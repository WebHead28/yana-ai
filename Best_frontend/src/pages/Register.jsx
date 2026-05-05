import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
import { personalityService } from '../services/personalityService'
import ParticleBackground from '../components/ParticleBackground'
import YanaLogo from '../components/YanaLogo'
import LoadingScreen from '../components/LoadingScreen'
import api from '../services/api'

export default function Register() {
  const { theme } = useTheme()
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.username || !form.email || !form.password) {
      setError('All fields are required.')
      return
    }

    setLoading(true)
    try {
      // Register user
      await authService.register(form.username, form.email, form.password)

      // Auto-login
      const loginData = await authService.login(form.username, form.password)
      login(loginData.access_token, { user_id: loginData.user_id })

      await new Promise((r) => setTimeout(r, 2200))
      navigate('/personality')
    } catch (err) {
      setLoading(false)
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
    }
  }

  if (loading) return <LoadingScreen text="Let's get to know each other..." />

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
        transition={{ duration: 0.6 }}
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 420,
          padding: '0 24px',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div style={{ position: 'relative', display: 'inline-flex' }}>
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
          <p style={{ color: theme.textMuted, fontSize: '0.85rem', marginTop: 6, letterSpacing: '0.08em' }}>
            Begin your journey
          </p>
        </div>

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
              <FieldInput
                label="Username"
                type="text"
                value={form.username}
                onChange={(v) => setForm({ ...form, username: v })}
                theme={theme}
                placeholder="your_username"
              />
              <FieldInput
                label="Email"
                type="email"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
                theme={theme}
                placeholder="you@email.com"
              />
              <div style={{ position: 'relative' }}>
                <FieldInput
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

              <RegisterBtn
                type="submit"
                theme={theme}
                disabled={!form.username || !form.email || !form.password}
              >
                <UserPlus size={18} />
                Create Account
              </RegisterBtn>
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
            Already have an account?{' '}
            <Link to="/login" style={{ color: theme.accent, textDecoration: 'none', fontWeight: 500 }}>
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

function FieldInput({ label, type, value, onChange, theme, placeholder }) {
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

function RegisterBtn({ children, type, disabled, theme }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      type={type}
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
        color: '#fff',
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
