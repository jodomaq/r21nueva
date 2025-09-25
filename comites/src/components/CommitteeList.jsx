import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid, IconButton, Box, Tooltip, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import api from '../api';
import DocumentUploadDialog from './DocumentUploadDialog';
import CommitteeForm from './CommitteeForm';

export default function CommitteeList({ onOpenMembers }) {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [openNew, setOpenNew] = useState(false);

  const load = async () => {
    const { data } = await api.get('/committees');
    setItems(data);
  };
  useEffect(() => { load(); }, []);

  const removeCommittee = async (c) => {
    if (!window.confirm(`¿Eliminar el comité "${c.name}"? Esta acción eliminará también sus integrantes y documentos.`)) return;
    try {
      await api.delete(`/committees/${c.id}`);
      await load();
    } catch (e) {
      alert(e.response?.data?.detail || 'No se pudo eliminar el comité');
    }
  };

  return (
    <Box>
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb:1 }}>
        <Typography variant="h6" gutterBottom sx={{ mb:0 }}>Mis Comités</Typography>
        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setOpenNew(true)}>Nuevo Comité</Button>
      </Box>
      {items.length === 0 && <Typography variant="body2">No hay comités disponibles. Para agregar clic en ➔ Menú ➔ Nuevo Comité</Typography>}
      <Grid container spacing={2}>
        {items.map(c => (
          <Grid item xs={12} sm={6} md={4} key={c.id}>
            <Card>
              <CardContent onClick={() => onOpenMembers && onOpenMembers(c)} sx={{ cursor: 'pointer' }}>
                <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{c.name}</Typography>
                  <Box onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Adjuntar documentos">
                      <IconButton size="small" onClick={() => setSelected(c)} sx={{ mr: 1 }}>
                        <AttachFileIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar comité">
                      <IconButton size="small" color="error" onClick={() => removeCommittee(c)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                <Typography variant="body2">Sección: {c.section_number}</Typography>
                <Typography variant="body2">Tipo: {c.type}</Typography>
                <Typography variant="body2">Integrantes: {c.members?.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {selected && <DocumentUploadDialog committee={selected} onClose={() => { setSelected(null); load(); }} />}
      <Dialog open={openNew} fullWidth maxWidth="lg" onClose={() => setOpenNew(false)}>
        <DialogTitle>Crear Nuevo Comité</DialogTitle>
        <DialogContent dividers>
          <CommitteeForm onCreated={() => { setOpenNew(false); load(); }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNew(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}