import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from '@react-oauth/google'
import logo from '../assets/logoR21blanco.png'
import StatusBanner from '../components/StatusBanner'
import {
  fetchCurrentUser,
  fetchMyAssignment,
  googleLoginRequest,
  usernamePasswordLoginRequest,
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

  const handleUsernamePasswordLogin = useCallback(
    async (username, password) => {
      try {
        setAuthenticating(true)
        setError('')

        if (!username || !password) {
          throw new Error('Usuario y contraseña son requeridos.')
        }

        const loginResponse = await usernamePasswordLoginRequest(username, password)
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
        return { success: true }
      } catch (err) {
        const errorMsg = getErrorMessage(err)
        setError(errorMsg)
        resetSession()
        return { success: false, error: errorMsg }
      } finally {
        setAuthenticating(false)
      }
    },
    [resetSession],
  )

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
      handleUsernamePasswordLogin,
      logout,
    }),
    [assignment, authenticating, error, handleGoogleError, handleGoogleSuccess, handleUsernamePasswordLogin, hasDashboardAccess, initializing, logout, user],
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
  const { authenticating, loginError, handleGoogleSuccess, handleGoogleError, handleUsernamePasswordLogin } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!username || !password) {
      setFormError('Por favor ingresa usuario y contraseña')
      return
    }

    const result = await handleUsernamePasswordLogin(username, password)
    if (!result.success) {
      setFormError(result.error)
    }
  }

  return (
    <div className="auth-screen auth-screen--gradient">
      <div className="auth-card">
        <img src={logo} alt="R21" className="auth-card__logo" />
        <h2>Dashboard estratégico R21 MORENA</h2>
        <p className="auth-card__subtitle">
          Inicia sesión con tu cuenta autorizada para visualizar los datos territoriales.
        </p>

        {(loginError || formError) && <StatusBanner type="error" message={formError || loginError} />}

        {/* Formulario de usuario y contraseña */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '16px', width: '100%' }}>
          <div style={{ marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={authenticating}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={authenticating}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
            />
          </div>
          <button
            type="submit"
            disabled={authenticating}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#8b1e3f',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: authenticating ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              opacity: authenticating ? 0.7 : 1,
              fontFamily: 'inherit'
            }}
          >
            {authenticating ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        {/* Separador */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '16px 0',
          gap: '8px',
          width: '100%'
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#ccc' }}></div>
          <span style={{ color: '#666', fontSize: '12px' }}>O</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#ccc' }}></div>
        </div>

        {/* Login con Google */}
        {googleClientId ? (
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} type="standard" theme="outline" />
        ) : (
          <StatusBanner type="error" message="Falta configurar VITE_GOOGLE_CLIENT_ID." />
        )}

        {authenticating && (
          <div className="auth-card__status">Verificando credenciales…</div>
        )}
      </div>
    </div>
  )
}
