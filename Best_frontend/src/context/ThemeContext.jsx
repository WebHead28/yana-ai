import { createContext, useContext, useState, useEffect } from 'react'
import { THEMES, DEFAULT_THEME } from '../theme/themes'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState(() => {
    return localStorage.getItem('yana_theme') || DEFAULT_THEME
  })

  const theme = THEMES[themeName] || THEMES[DEFAULT_THEME]

  useEffect(() => {
    localStorage.setItem('yana_theme', themeName)
    const root = document.documentElement
    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value)
    })
    root.style.setProperty('--theme-bg', theme.bg)
  }, [themeName, theme])

  return (
    <ThemeContext.Provider value={{ theme, themeName, setThemeName, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
