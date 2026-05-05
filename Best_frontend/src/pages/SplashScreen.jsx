import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import YanaLogo from '../components/YanaLogo'

export default function SplashScreen() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { token, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    const timer = setTimeout(() => {
      if (token) {
        navigate('/chat')
      } else {
        navigate('/login')
      }
    }, 4000)
    return () => clearTimeout(timer)
  }, [loading, token, navigate])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: theme.gradient,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow orbs */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '20%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.accentGlow} 0%, transparent 70%)`,
          filter: 'blur(40px)',
          animation: 'breathe 5s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '20%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.accentGlow} 0%, transparent 70%)`,
          filter: 'blur(40px)',
          animation: 'breathe 5s ease-in-out infinite 2.5s',
        }}
      />

      {/* Logo with breathing glow */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <div
          style={{
            position: 'absolute',
            inset: -40,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${theme.accentGlow} 0%, transparent 70%)`,
            animation: 'breathe 4s ease-in-out infinite',
          }}
        />
        <YanaLogo size={120} animate />
      </motion.div>

      {/* Brand name */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        style={{ zIndex: 1, marginTop: 32, textAlign: 'center' }}
      >
        <h1
          style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '2.5rem',
            fontWeight: 500,
            color: theme.accent,
            letterSpacing: '0.35em',
          }}
        >
          Y.A.N.A.
        </h1>
        <p
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.8rem',
            color: theme.textMuted,
            letterSpacing: '0.2em',
            marginTop: 8,
          }}
        >
          YOU ARE NOT ALONE
        </p>
      </motion.div>

      {/* Loading text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        style={{ zIndex: 1, marginTop: 60, textAlign: 'center' }}
      >
        <p
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.9rem',
            color: theme.textMuted,
            marginBottom: 16,
          }}
        >
          Starting YANA...
        </p>

        {/* Waveform */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            height: 28,
          }}
        >
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="wave-bar"
              style={{
                width: 4,
                height: 4,
                borderRadius: 2,
                background: theme.accent,
                opacity: 0.7,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
