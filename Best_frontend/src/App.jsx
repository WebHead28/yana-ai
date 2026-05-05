import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useTheme } from './context/ThemeContext'
import SplashScreen from './pages/SplashScreen'
import Login from './pages/Login'
import Register from './pages/Register'
import PersonalityTest from './pages/PersonalityTest'
import Introduction from './pages/Introduction'
import CompanionGeneration from './pages/CompanionGeneration'
import Chat from './pages/Chat'

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth()
  if (loading) return null
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { theme } = useTheme()

  return (
    <div
      style={{
        background: theme.gradient,
        minHeight: '100vh',
        color: theme.text,
        transition: 'background 0.5s ease, color 0.3s ease',
      }}
    >
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/personality"
          element={
            <ProtectedRoute>
              <PersonalityTest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/introduction"
          element={
            <ProtectedRoute>
              <Introduction />
            </ProtectedRoute>
          }
        />
        <Route
          path="/generating"
          element={
            <ProtectedRoute>
              <CompanionGeneration />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
