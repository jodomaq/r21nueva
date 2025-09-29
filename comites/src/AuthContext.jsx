import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleLogin, googleLogout, GoogleOAuthProvider } from '@react-oauth/google';
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

if (!googleClientId) {
  console.warn('[Auth] Google Client ID no definido. Configura VITE_GOOGLE_CLIENT_ID o REACT_APP_GOOGLE_CLIENT_ID en .env.');
}

function InternalAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [assignment, setAssignment] = useState({ role: null, committees_owned: [] });
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async credentialResponse => {
    try {
      setLoading(true);
      const id_token = credentialResponse.credential;
      const { data } = await api.post('/auth/google', { id_token });
      localStorage.setItem('token', data.access_token);
      setUser(data.user);
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
      alert('Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    googleLogout();
    setUser(null);
    setAssignment({ role: null, committees_owned: [] });
  };

  // Try bootstrap from existing token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    (async () => {
      try {
        const me = await api.get('/auth/me');
        setUser(me.data);
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
    <AuthContext.Provider value={{ user, setUser, assignment, setAssignment, handleGoogleSuccess, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }) {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <InternalAuthProvider>{children}</InternalAuthProvider>
    </GoogleOAuthProvider>
  );
}

export function useAuth() { return useContext(AuthContext); }

export function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <LoginScreen />;
  return children;
}

export function LoginScreen() {
  const { handleGoogleSuccess, loading } = useAuth();
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100vh',gap:24, backgroundColor:'#8b1e3f'}}>
    <h2 style={{color:'white'}}>Comités territoriales</h2>
    <img src={logo} alt="Logo R21" style={{ height: 80 }} />
      <div style={{backgroundColor:'rgba(255, 255, 255)', padding: 16, borderRadius: 8}} >
        <p>Inicia sesión con tu cuenta de Gmail</p>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => alert('Error al iniciar sesión')}
          text="signin_with"
          shape="rectangular"
          size="large"
          theme="outline"
          // Quita useOneTap si no está correctamente configurado el origin
          // useOneTap
        />
        {loading && <span>Verificando...</span>}
      </div>
    </div>
  );
}