import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider, CssBaseline, Container } from '@mui/material';
import { theme } from './theme';
import App from './App';
import { AuthProvider, RequireAuth } from './AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <RequireAuth>
          <Container maxWidth="lg" sx={{ px: 1 }}>
            <App />
          </Container>
        </RequireAuth>
      </AuthProvider>
    </ThemeProvider>
  </GoogleOAuthProvider>
);