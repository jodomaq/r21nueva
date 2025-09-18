import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid, IconButton, Box, Tooltip } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../api';
import DocumentUploadDialog from './DocumentUploadDialog';

export default function CommitteeList({ onOpenMembers }) {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);

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
      <Typography variant="h6" gutterBottom>Mis Comités</Typography>
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
    </Box>
  );
}