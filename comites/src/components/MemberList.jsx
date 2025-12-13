import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton, List, ListItem, ListItemText, Button, Paper, Stack, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../api';
import { useAuth } from '../AuthContext';

export default function MemberList({ committeeId, onBack, onAddMember, readonly = false }) {
  const [committee, setCommittee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/committees/${committeeId}`);
      console.log('Committee data:', data);
      setCommittee(data);
      setError(null);
    } catch (e) {
      setError(e.response?.data?.detail || 'Error al cargar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [committeeId]);

  const removeMember = async (memberId) => {
    if (!window.confirm('¿Eliminar integrante?')) return;
    try {
      const { data } = await api.delete(`/committees/${committeeId}/members/${memberId}`);
      setCommittee(data);
    } catch (e) {
      alert(e.response?.data?.detail || 'No se pudo eliminar');
    }
  };

  const canAdd = !readonly && (committee?.members?.length || 0) < 10; // backend setting also enforces this

  return (
    <Paper sx={{ p:2 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb:2 }}>
        <IconButton onClick={onBack}><ArrowBackIcon /></IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>Integrantes</Typography>
        <Tooltip title={canAdd ? 'Añadir integrante' : (readonly ? 'No tienes permiso para agregar' : 'Límite alcanzado')}>
          <span>
            <IconButton color="primary" onClick={onAddMember} disabled={!canAdd}>
              <AddIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
      {loading && <Typography>Cargando…</Typography>}
      {error && <Typography color="error">{error}</Typography>}
      {committee && (
        <>
          <Box sx={{ mb:2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight:600 }}>Nombre del comité: {committee.name} - Encargado: {user?.name || '—'}</Typography>
            <Typography variant="body2">Sección: {committee.section_number} · Tipo: {committee.type}</Typography>
            <Typography variant="body2">Presidente: {committee.presidente || '—'} · Correo: {committee.email || '—'}</Typography>
            <Typography variant="body2">Clave afiliación: {committee.clave_afiliacion || '—'} · Teléfono: {committee.telefono || '—'}</Typography>
            <Typography variant="body2">Integrantes: {committee.members?.length || 0} / 10</Typography>
          </Box>
          {committee.members?.length ? (
            <List>
              {committee.members.map(m => (
                <ListItem
                  key={m.id}
                  divider
                  secondaryAction={
                    <IconButton edge="end" color="error" onClick={() => removeMember(m.id)} disabled={readonly}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={m.full_name}
                    secondary={`INE: ${m.ine_key || '—'} · Tel: ${m.phone || '—'} · Email: ${m.email || '—'} · Sección: ${m.section_number || '—'} · Invitado por: ${m.invited_by || '—'}`}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2">No hay integrantes aún.</Typography>
          )}
        </>
      )}
    </Paper>
  );
}
