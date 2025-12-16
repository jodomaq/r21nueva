import React, { useMemo, useState } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItem, ListItemText, Box, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuth } from '../AuthContext';
import logo from '../assets/logoR21blanco.png';

export default function Layout({ children, onNavigate }) {
  const [open, setOpen] = useState(false);
  const { logout, user, assignment, isAdmin } = useAuth();
  const role = assignment?.role ?? null;
  const canCreateCommittees = role !== 6;

  const menuItems = useMemo(() => {
    const items = [{ key: 'committees', label: 'Listar Comités' }];
    if (canCreateCommittees) items.push({ key: 'new', label: 'Nuevo Comité' });
    if (isAdmin) items.push({ key: 'admin', label: 'Administración', icon: true });
    return items;
  }, [canCreateCommittees, isAdmin]);

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ background: '#8b1e3f' }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Box component="img" src={logo} alt="Logo" sx={{ height: 40, mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}>Michoacán</Typography>
          <Typography variant="h6" sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}>Usuario: {user?.name || '—'}</Typography>
          
          {isAdmin && (
            <Button
              startIcon={<AdminPanelSettingsIcon />}
              sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
              style={{ color: 'white', fontWeight: 'bold' }}
              onClick={() => onNavigate('admin')}
            >
              Administración
            </Button>
          )}
          
          <Button sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }} style={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }} color="inherit" onClick={logout}>Salir</Button>
        </Toolbar>
      </AppBar>
      <Drawer open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 250 }} role="presentation">
          <List>
            <ListItem button style={{ cursor: 'pointer' }} key="user">
                <ListItemText primary={user.name} />
            </ListItem>
            {menuItems.map(item => (
              <ListItem button style={{ cursor: 'pointer' }} key={item.key} onClick={() => { onNavigate(item.key); setOpen(false); }}>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
              <ListItem button style={{ cursor: 'pointer' }} key="logout" onClick={logout}>
                <ListItemText primary="Salir" />
              </ListItem>
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 2, mt: 8, width: '100%' }}>
        {children}
      </Box>
    </Box>
  );
}