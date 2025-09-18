import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItem, ListItemText, Box, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../AuthContext';
import logo from '../assets/logoR21blanco.png';

export default function Layout({ children, onNavigate }) {
  const [open, setOpen] = useState(false);
  const { logout, user } = useAuth();

  const menuItems = [
    { key: 'committees', label: 'Listar Comités' },
    { key: 'new', label: 'Nuevo Comité' }
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ background: '#8b1e3f' }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Box component="img" src={logo} alt="Logo" sx={{ height: 40, mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Michoacán</Typography>
          <h5>Usuario: {user.name}</h5>
          <Button style={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }} color="inherit" onClick={logout}>Salir</Button>
        </Toolbar>
      </AppBar>
      <Drawer open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 250 }} role="presentation">
          <List>
            {menuItems.map(item => (
              <ListItem button style={{ cursor: 'pointer' }} key={item.key} onClick={() => { onNavigate(item.key); setOpen(false); }}>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 2, mt: 8, width: '100%' }}>
        {children}
      </Box>
    </Box>
  );
}