import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleLogin, googleLogout, GoogleOAuthProvider } from '@react-oauth/google';
import { MsalProvider, useMsal } from '@azure/msal-react';
import { PublicClientApplication, InteractionType } from '@azure/msal-browser';
import api from './api';
import logo from './assets/logoR21blanco.png';

const AuthContext = createContext(null);

// Obtiene clientId de Vite (import.meta.env) o, si existe, de process.env (CRA / Node) de forma segura
const googleClientId =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GOOGLE_CLIENT_ID) ||
  (typeof process !== 'undefined' &&
    process.env &&
    (process.env.VITE_GOOGLE_CLIENT_ID || process.env.REACT_APP_GOOGLE_CLIENT_ID)) ||
  '';

const microsoftClientId =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_MICROSOFT_CLIENT_ID) ||
  (typeof process !== 'undefined' && process.env && process.env.VITE_MICROSOFT_CLIENT_ID) ||
  '';

if (!googleClientId) {
  console.warn('[Auth] Google Client ID no definido. Configura VITE_GOOGLE_CLIENT_ID o REACT_APP_GOOGLE_CLIENT_ID en .env.');
}

if (!microsoftClientId) {
  console.warn('[Auth] Microsoft Client ID no definido. Configura VITE_MICROSOFT_CLIENT_ID en .env.');
}

// Configuración de MSAL para Microsoft
const msalConfig = {
  auth: {
    clientId: microsoftClientId,
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

const msalInstance = microsoftClientId ? new PublicClientApplication(msalConfig) : null;

function InternalAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [assignment, setAssignment] = useState({ role: null, committees_owned: [] });
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleGoogleSuccess = async credentialResponse => {
    try {
      setLoading(true);
      const id_token = credentialResponse.credential;
      const { data } = await api.post('/auth/google', { id_token });
      localStorage.setItem('token', data.access_token);
      setUser(data.user);
      setIsAdmin(data.user.email === 'jodomaq@gmail.com');
      console.log('User after login', data.user);
      // Fetch assignment after login
      try {
        const a = await api.get('/auth/me/assignment');
        console.log('Assignment after login', a.data);
        setAssignment(a.data || { role: null, committees_owned: [] });
      } catch (err) {
        console.warn('No se pudo obtener el rol', err);
        setAssignment({ role: null, committees_owned: [] });
      }
    } catch (e) {
      console.error(e);
      alert('Error de autenticación con Google');
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    if (!msalInstance) {
      alert('Microsoft authentication no está configurado');
      return;
    }
    
    try {
      setLoading(true);
      const loginRequest = {
        scopes: ['User.Read'],
      };
      
      const response = await msalInstance.loginPopup(loginRequest);
      const accessToken = response.accessToken;
      
      // Enviar el token al backend
      const { data } = await api.post('/auth/microsoft', { access_token: accessToken });
      localStorage.setItem('token', data.access_token);
      setUser(data.user);
      setIsAdmin(data.user.email === 'jodomaq@gmail.com');
      setIsAdmin(data.user.email === 'Karinarojas2597@gmail.com')
      setIsAdmin(data.user.email === 'raul_moron_orozco@hotmail.com');
      setIsAdmin(data.user.email === 'Karinarojas2597@gmail.com')

      console.log('User after Microsoft login', data.user);
      
      // Fetch assignment after login
      try {
        const a = await api.get('/auth/me/assignment');
        console.log('Assignment after login', a.data);
        setAssignment(a.data || { role: null, committees_owned: [] });
      } catch (err) {
        console.warn('No se pudo obtener el rol', err);
        setAssignment({ role: null, committees_owned: [] });
      }
    } catch (e) {
      console.error(e);
      alert('Error de autenticación con Microsoft');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    googleLogout();
    setUser(null);
    setAssignment({ role: null, committees_owned: [] });
    setIsAdmin(false);
  };

  // Try bootstrap from existing token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    (async () => {
      try {
        const me = await api.get('/auth/me');
        setUser(me.data);
        setIsAdmin(me.data.email === 'jodomaq@gmail.com');
        // There is no backend endpoint for /auth/me user profile yet; we can infer user by calling /committees (which requires auth) or skip.
        // Minimal: fetch assignment to decide UI
        const a = await api.get('/auth/me/assignment');
        setAssignment(a.data || { role: null, committees_owned: [] });
        // Optionally, get minimal user info by decoding token payload; skip to keep logic simple.
      } catch (err) {
        console.warn('Token inválido o expirado', err);
        localStorage.removeItem('token');
      }
    })();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, assignment, setAssignment, handleGoogleSuccess, handleMicrosoftLogin, logout, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }) {
  const content = (
    <GoogleOAuthProvider clientId={googleClientId}>
      <InternalAuthProvider>{children}</InternalAuthProvider>
    </GoogleOAuthProvider>
  );

  // Si hay MSAL configurado, envolver con MsalProvider
  if (msalInstance) {
    return <MsalProvider instance={msalInstance}>{content}</MsalProvider>;
  }

  return content;
}

export function useAuth() { return useContext(AuthContext); }

export function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <LoginScreen />;
  return children;
}

export function LoginScreen() {
  const { handleGoogleSuccess, handleMicrosoftLogin, loading } = useAuth();
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100vh',gap:24, backgroundColor:'#8b1e3f'}}>
    <h2 style={{color:'white'}}>Comités territoriales</h2>
    <img src={logo} alt="Logo R21" style={{ height: 80 }} />
      <div style={{backgroundColor:'rgba(255, 255, 255)', padding: 16, borderRadius: 8}} >
        <p>Inicia sesión con tu cuenta</p>
        
        <div style={{ marginBottom: 16 }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => alert('Error al iniciar sesión con Google')}
            text="signin_with"
            shape="rectangular"
            size="large"
            theme="outline"
          />
        </div>
        
        {msalInstance && (
          <button
            onClick={handleMicrosoftLogin}
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#2F2F2F',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
              <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
              <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
            </svg>
            Iniciar sesión con Microsoft
          </button>
        )}
        
        {loading && <span style={{ display: 'block', marginTop: 12, textAlign: 'center' }}>Verificando...</span>}
      </div>
    </div>
  );
}