import { motion } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { THEMES } from '../theme/themes'

export default function ThemeSwitcher({ onClose }) {
  const { theme, themeName, setThemeName } = useTheme()

  const previews = {
    lightWarm: { bg: '#FAF6F1', accent: '#CD853F', text: '#2C1810' },
    darkCalm: { bg: '#1A1714', accent: '#C4956A', text: '#F5EBE0' },
    blueSerenity: { bg: '#F0F4FA', accent: '#4A7AB5', text: '#1A2A3A' },
    peachComfort: { bg: '#FEF8F3', accent: '#E8896A', text: '#2A1510' },
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
          maxWidth: 440,
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
            Choose Your Mood
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: theme.textMuted,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: '50%',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {Object.entries(THEMES).map(([key, t]) => {
            const preview = previews[key]
            const isActive = themeName === key

            return (
              <button
                key={key}
                onClick={() => { setThemeName(key); onClose() }}
                style={{
                  borderRadius: 14,
                  border: `2px solid ${isActive ? theme.accent : theme.border}`,
                  background: preview.bg,
                  padding: 16,
                  cursor: 'pointer',
                  position: 'relative',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? `0 0 16px ${theme.accentGlow}` : 'none',
                  overflow: 'hidden',
                }}
              >
                {/* Color swatch */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: preview.accent,
                    marginBottom: 10,
                    boxShadow: `0 0 12px ${preview.accent}40`,
                  }}
                />

                <p
                  style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    color: preview.text,
                    marginBottom: 2,
                  }}
                >
                  {t.name}
                </p>
                <p style={{ fontSize: '0.72rem', color: preview.text, opacity: 0.6 }}>
                  {key === 'lightWarm' && 'Soft & warm'}
                  {key === 'darkCalm' && 'Deep & calm'}
                  {key === 'blueSerenity' && 'Serene & clear'}
                  {key === 'peachComfort' && 'Cozy & gentle'}
                </p>

                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: preview.accent,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={12} color="#fff" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
