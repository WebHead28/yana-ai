import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import YanaLogo from './YanaLogo'

export default function LoadingScreen({ text = 'Loading...', showNeural = false }) {
  const { theme } = useTheme()

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
        zIndex: 50,
      }}
    >
      {showNeural && <NeuralBg theme={theme} />}

      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'relative', marginBottom: 32 }}
      >
        {/* Glow ring */}
        <div
          style={{
            position: 'absolute',
            inset: -24,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${theme.accentGlow} 0%, transparent 70%)`,
            animation: 'breathe 3s ease-in-out infinite',
          }}
        />
        <YanaLogo size={80} />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '1.1rem',
          color: theme.textSecondary,
          letterSpacing: '0.05em',
          marginBottom: 24,
        }}
      >
        {text}
      </motion.p>

      {/* Animated dots */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: theme.accent,
              opacity: 0.6,
            }}
            className={`dot-${i + 1}`}
          />
        ))}
      </div>
    </motion.div>
  )
}

function NeuralBg({ theme }) {
  const nodes = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: 10 + (i % 4) * 28 + Math.random() * 5,
    y: 10 + Math.floor(i / 4) * 30 + Math.random() * 5,
  }))

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        opacity: 0.15,
        pointerEvents: 'none',
      }}
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        {nodes.map((a) =>
          nodes.map((b) => {
            if (a.id >= b.id) return null
            const dist = Math.hypot(a.x - b.x, a.y - b.y)
            if (dist > 35) return null
            return (
              <line
                key={`${a.id}-${b.id}`}
                x1={`${a.x}%`}
                y1={`${a.y}%`}
                x2={`${b.x}%`}
                y2={`${b.y}%`}
                stroke={theme.accent}
                strokeWidth="1"
                className="neural-line"
                style={{ animationDelay: `${(a.id + b.id) * 0.15}s` }}
              />
            )
          })
        )}
        {nodes.map((n) => (
          <circle
            key={n.id}
            cx={`${n.x}%`}
            cy={`${n.y}%`}
            r="4"
            fill={theme.accent}
            className="neural-node"
            style={{ animationDelay: `${n.id * 0.2}s` }}
          />
        ))}
      </svg>
    </div>
  )
}
