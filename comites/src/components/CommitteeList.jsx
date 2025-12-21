import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid, IconButton, Box, Tooltip, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import api from '../api';
import DocumentUploadDialog from './DocumentUploadDialog';
import CommitteeForm from './CommitteeForm';

export default function CommitteeList({ onOpenMembers, canCreate = true, canOpenMembers = true }) {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [openNew, setOpenNew] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [committeeForDoc, setCommitteeForDoc] = useState(null);

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

  const handleCardClick = (committee) => {
    if (!canOpenMembers) return;

    if (committee.has_document) {
      if (onOpenMembers) {
        onOpenMembers(committee);
      }
    } else {
      setCommitteeForDoc(committee);
      setDialogOpen(true);
    }
  };

  return (
    <Box>
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb:1 }}>
        <Typography variant="h6" gutterBottom sx={{ mb:0 }}>Mis Comités</Typography>
        <Tooltip title={canCreate ? 'Crear un nuevo comité' : 'Tu rol no permite crear comités'}>
          <span>
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setOpenNew(true)} disabled={!canCreate}>Nuevo Comité</Button>
          </span>
        </Tooltip>
      </Box>
      {items.length === 0 && (
        <Typography variant="body2">
          {canCreate
            ? 'No hay comités disponibles. Para agregar clic en ➔ Menú ➔ Nuevo Comité'
            : 'No tienes comités asignados. Tu rol solo permite gestionar integrantes de tu propio comité cuando exista.'}
        </Typography>
      )}
      <Grid container spacing={2}>
        {items.map(c => (
          <Grid item xs={12} sm={6} md={4} key={c.id}>
            <Card>
              <CardContent
                onClick={() => handleCardClick(c)}
                sx={{ cursor: canOpenMembers ? 'pointer' : 'default' }}
              >
                <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{c.name}</Typography>
                    {!c.has_document && (
                      <Tooltip title="Debe adjuntar el acta de comité">
                        <WarningAmberIcon color="warning" />
                      </Tooltip>
                    )}
                  </Box>
                  <Box onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Adjuntar acta de comité">
                      <IconButton size="small" onClick={() => setSelected(c)} sx={{ mr: 1 }}>
                        <AttachFileIcon />
                      </IconButton>
                    </Tooltip>
                    {canCreate && (
                      <Tooltip title="Eliminar comité">
                        <IconButton size="small" color="error" onClick={() => removeCommittee(c)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
                {!c.has_document && 
                  <Typography variant="body2" color="error">Debe adjuntar acta de comité</Typography>
                }
                <Typography variant="body2">Sección: {c.section_number}</Typography>
                <Typography variant="body2">Tipo: {c.type}</Typography>
                <Typography variant="body2">Presidente: {c.presidente || '—'}</Typography>
                <Typography variant="body2">Correo: {c.email || '—'}</Typography>
                <Typography variant="body2">Clave afiliación: {c.clave_afiliacion || '—'}</Typography>
                <Typography variant="body2">Teléfono: {c.telefono || '—'}</Typography>
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
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Acta de Comité Requerida</DialogTitle>
        <DialogContent>
          <Typography>Debe adjuntar el acta de comité antes de añadir miembros.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={() => {
            setDialogOpen(false);
            setSelected(committeeForDoc);
            setCommitteeForDoc(null);
          }}>Adjuntar Acta</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}