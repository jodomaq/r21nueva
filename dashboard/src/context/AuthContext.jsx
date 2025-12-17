import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from '@react-oauth/google'
import logo from '../assets/logoR21blanco.png'
import StatusBanner from '../components/StatusBanner'
import {
  fetchCurrentUser,
  fetchMyAssignment,
  googleLoginRequest,
} from '../api/client'

const AuthContext = createContext(null)

const googleClientId =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GOOGLE_CLIENT_ID) ||
  (typeof process !== 'undefined' &&
    process.env &&
    (process.env.VITE_GOOGLE_CLIENT_ID || process.env.REACT_APP_GOOGLE_CLIENT_ID)) ||
  ''

if (!googleClientId) {
  // eslint-disable-next-line no-console
  console.warn(
    '[Auth] Google Client ID no definido. Configura VITE_GOOGLE_CLIENT_ID o REACT_APP_GOOGLE_CLIENT_ID en .env.',
  )
}

const getErrorMessage = (error) => {
  if (!error) return 'Error de autenticación. Intenta nuevamente.'
  if (typeof error === 'string') return error
  const detail = error?.response?.data?.detail
  if (detail) return detail
  if (error?.message) return error.message
  return 'Error de autenticación. Intenta nuevamente.'
}

function InternalAuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [assignment, setAssignment] = useState(null)
  const [initializing, setInitializing] = useState(true)
  const [authenticating, setAuthenticating] = useState(false)
  const [error, setError] = useState('')

  const hasDashboardAccess = assignment?.role != null && assignment.role === 1

  const resetSession = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('token')
    }
    setUser(null)
    setAssignment(null)
  }, [])

  const loadProfile = useCallback(async () => {
    const me = await fetchCurrentUser()
    setUser(me)
    const assignmentResponse = await fetchMyAssignment().catch(() => null)
    setAssignment(assignmentResponse)
    if (!assignmentResponse || assignmentResponse.role == null || assignmentResponse.role > 5) {
      setError('Tu cuenta no cuenta con permisos para acceder a este dashboard.')
    } else {
      setError('')
    }
  }, [])

  useEffect(() => {
    const bootstrap = async () => {
      if (typeof window === 'undefined') {
        setInitializing(false)
        return
      }
      const token = window.localStorage.getItem('token')
      if (!token) {
        setInitializing(false)
        return
      }
      try {
        await loadProfile()
      } catch (err) {
        setError(getErrorMessage(err))
        resetSession()
      } finally {
        setInitializing(false)
      }
    }
    bootstrap()
  }, [loadProfile, resetSession])

  const handleGoogleSuccess = useCallback(
    async (credentialResponse) => {
      try {
        setAuthenticating(true)
        setError('')
        const idToken = credentialResponse?.credential
        if (!idToken) {
          throw new Error('No se recibió el token de Google.')
        }
        const loginResponse = await googleLoginRequest(idToken)
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('token', loginResponse.access_token)
        }
        setUser(loginResponse.user)
        const assignmentResponse = await fetchMyAssignment().catch(() => null)
        setAssignment(assignmentResponse)
        if (!assignmentResponse || assignmentResponse.role == null || assignmentResponse.role > 5) {
          setError('Tu cuenta no cuenta con permisos para acceder a este dashboard.')
        } else {
          setError('')
        }
      } catch (err) {
        setError(getErrorMessage(err))
        resetSession()
      } finally {
        setAuthenticating(false)
      }
    },
    [resetSession],
  )

  const handleGoogleError = useCallback(() => {
    setError('No se pudo iniciar sesión con Google. Intenta nuevamente.')
  }, [])

  const logout = useCallback(() => {
    googleLogout()
    resetSession()
    setError('')
  }, [resetSession])

  const value = useMemo(
    () => ({
      user,
      assignment,
      initializing,
      authenticating,
      hasDashboardAccess,
      loginError: error,
      handleGoogleSuccess,
      handleGoogleError,
      logout,
    }),
    [assignment, authenticating, error, handleGoogleError, handleGoogleSuccess, hasDashboardAccess, initializing, logout, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function AuthProvider({ children }) {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <InternalAuthProvider>{children}</InternalAuthProvider>
    </GoogleOAuthProvider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}

export function LoginScreen() {
  const { authenticating, loginError, handleGoogleSuccess, handleGoogleError } = useAuth()

  return (
    <div className="auth-screen auth-screen--gradient">
      <div className="auth-card">
        <img src={logo} alt="R21" className="auth-card__logo" />
        <h2>Dashboard estratégico R21 MORENA</h2>
        <p className="auth-card__subtitle">
          Inicia sesión con tu cuenta autorizada para visualizar los datos territoriales.
        </p>
        {loginError ? <StatusBanner type="error" message={loginError} /> : null}
        {googleClientId ? (
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} type="standard" theme="outline" />
        ) : (
          <StatusBanner type="error" message="Falta configurar VITE_GOOGLE_CLIENT_ID." />
        )}
        {authenticating ? (
          <div className="auth-card__status">Verificando credenciales…</div>
        ) : null}
      </div>
    </div>
  )
}
