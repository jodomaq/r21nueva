import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { main: '#8b1e3f', contrastText: '#fff' },
    secondary: { main: '#424242' },
    background: { default: '#f5f5f5' }
  },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 8 } } }
  }
});