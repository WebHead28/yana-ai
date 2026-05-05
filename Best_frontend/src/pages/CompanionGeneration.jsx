import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import YanaLogo from '../components/YanaLogo'

const GENERATION_LINES = [
  'Calibrating empathy...',
  'Loading personality matrix...',
  'Teaching YANA how to listen...',
  'Preparing your safe space...',
  'Syncing emotional wavelengths...',
  'Building memory foundations...',
  'Almost ready...',
]

export default function CompanionGeneration() {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [visibleLines, setVisibleLines] = useState([])
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let lineIndex = 0
    const lineInterval = setInterval(() => {
      if (lineIndex < GENERATION_LINES.length) {
        setVisibleLines((prev) => [...prev, GENERATION_LINES[lineIndex]])
        lineIndex++
      } else {
        clearInterval(lineInterval)
      }
    }, 600)

    // Animate progress
    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(progressInterval)
          setDone(true)
          return 100
        }
        return p + 1.2
      })
    }, 55)

    return () => {
      clearInterval(lineInterval)
      clearInterval(progressInterval)
    }
  }, [])

  useEffect(() => {
    if (done) {
      const t = setTimeout(() => navigate('/chat'), 800)
      return () => clearTimeout(t)
    }
  }, [done, navigate])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Pulsing orbs */}
      <div
        style={{
          position: 'absolute',
          top: '25%',
          left: '35%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.accentGlow} 0%, transparent 70%)`,
          filter: 'blur(50px)',
          animation: 'breathe 3s ease-in-out infinite',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 500, width: '100%', padding: '0 32px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  inset: -30,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${theme.accentGlow} 0%, transparent 70%)`,
                  animation: 'breathe 2s ease-in-out infinite',
                }}
              />
              <YanaLogo size={80} animate />
            </div>
          </div>

          <h2
            style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '1.5rem',
              color: theme.accent,
              marginBottom: 6,
            }}
          >
            Generating your talking companion...
          </h2>
          <p style={{ color: theme.textMuted, fontSize: '0.85rem' }}>
            This will just take a moment
          </p>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: 4,
            borderRadius: 2,
            background: theme.border,
            overflow: 'hidden',
            marginBottom: 32,
          }}
        >
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            style={{
              height: '100%',
              background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentHover})`,
              boxShadow: `0 0 12px ${theme.accentGlow}`,
              borderRadius: 2,
            }}
          />
        </div>

        {/* Generation lines */}
        <div
          style={{
            background: theme.bgCard,
            backdropFilter: 'blur(16px)',
            borderRadius: 16,
            border: `1px solid ${theme.border}`,
            padding: '20px 24px',
            minHeight: 180,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <AnimatePresence>
            {visibleLines.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10 }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: theme.accent,
                    flexShrink: 0,
                    boxShadow: `0 0 6px ${theme.accentGlow}`,
                  }}
                />
                <p
                  style={{
                    color: i === visibleLines.length - 1 ? theme.text : theme.textMuted,
                    fontSize: '0.9rem',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  {line}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Blinking cursor at end */}
          {visibleLines.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: theme.accent,
                  flexShrink: 0,
                  opacity: 0.4,
                }}
              />
              <span className="typing-cursor" style={{ color: theme.accent }} />
            </div>
          )}
        </div>

        {/* Percentage */}
        <p
          style={{
            textAlign: 'center',
            marginTop: 16,
            color: theme.textMuted,
            fontSize: '0.85rem',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          {Math.round(progress)}%
        </p>
      </div>
    </div>
  )
}
