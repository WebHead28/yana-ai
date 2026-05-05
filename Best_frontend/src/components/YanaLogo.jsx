import { useTheme } from '../context/ThemeContext'

export default function YanaLogo({ size = 80, className = '', animate = false }) {
  const { theme } = useTheme()

  return (
    <div
      className={`inline-flex items-center justify-center ${animate ? 'animate-breathe' : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 220"
        fill="none"
        style={{ color: theme.accent, width: '100%', height: '100%' }}
      >
        {/* Outer petals */}
        <path
          d="M100 30 C85 50, 55 55, 50 80 C45 105, 65 120, 80 130 C60 125, 38 118, 35 95 C30 68, 55 40, 100 30Z"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M100 30 C115 50, 145 55, 150 80 C155 105, 135 120, 120 130 C140 125, 162 118, 165 95 C170 68, 145 40, 100 30Z"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Wing petals */}
        <path
          d="M55 100 C35 90, 18 105, 22 125 C26 145, 50 150, 70 140"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M145 100 C165 90, 182 105, 178 125 C174 145, 150 150, 130 140"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        {/* Inner heart/V shape */}
        <path
          d="M75 85 C80 95, 90 100, 100 108 C110 100, 120 95, 125 85"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        {/* Center lower petals */}
        <path
          d="M80 130 C72 145, 68 162, 78 175 C88 188, 112 188, 122 175 C132 162, 128 145, 120 130"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        {/* Cross lines in center */}
        <path
          d="M80 130 C90 140, 100 150, 100 165"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M120 130 C110 140, 100 150, 100 165"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        {/* Top antenna lines */}
        <path
          d="M92 32 C90 18, 88 10, 93 5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M108 32 C110 18, 112 10, 107 5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Bottom root curl */}
        <path
          d="M85 195 C75 205, 65 200, 68 192"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M115 195 C125 205, 135 200, 132 192"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  )
}
