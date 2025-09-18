import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleLogin, googleLogout, GoogleOAuthProvider } from '@react-oauth/google';
import api from './api';

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
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async credentialResponse => {
    try {
      setLoading(true);
      const id_token = credentialResponse.credential;
      const { data } = await api.post('/auth/google', { id_token });
      localStorage.setItem('token', data.access_token);
      setUser(data.user);
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
  };

  return (
    <AuthContext.Provider value={{ user, setUser, handleGoogleSuccess, logout, loading }}>
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
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100vh',gap:24}}>
      <h2>Comités MORENA</h2>
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
  );
}