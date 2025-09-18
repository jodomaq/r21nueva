import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, ImageList, ImageListItem, Typography, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../api';

export default function DocumentUploadDialog({ committee, onClose }) {
  const [files, setFiles] = useState([]);
  const [docs, setDocs] = useState([]);

  const loadDocs = async () => {
    const { data } = await api.get(`/committees/${committee.id}/documents`);
    setDocs(data);
  };
  useEffect(() => { loadDocs(); }, [committee.id]);

  const submit = async () => {
    const form = new FormData();
    files.forEach(f => form.append('files', f));
    await api.post(`/committees/${committee.id}/documents`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
    setFiles([]);
    await loadDocs();
  };
  const removeDoc = async (doc) => {
    if (!window.confirm(`¿Eliminar el documento "${doc.original_name}"?`)) return;
    try {
      await api.delete(`/committees/${committee.id}/documents/${doc.id}`);
      await loadDocs();
    } catch (e) {
      alert(e.response?.data?.detail || 'No se pudo eliminar');
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Documentos de {committee.name}</DialogTitle>
      <DialogContent>
        <Box sx={{ display:'flex', flexDirection:'column', gap:2 }}>
          <input type="file" accept="image/*" capture="environment" multiple onChange={e => setFiles(Array.from(e.target.files))} />
          {files.length > 0 && <Typography>{files.length} archivo(s) listo(s)</Typography>}
          <ImageList cols={3} gap={8}>
            {docs.map(d => (
              <ImageListItem key={d.id} sx={{ position: 'relative' }}>
                <img src={`${import.meta.env.VITE_API_BASE || 'http://localhost:8000'}/uploads/${d.filename}`} alt={d.original_name} loading="lazy" />
                <Box sx={{ position: 'absolute', top: 4, right: 4 }}>
                  <Tooltip title="Eliminar documento">
                    <IconButton size="small" color="error" onClick={() => removeDoc(d)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </ImageListItem>
            ))}
          </ImageList>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
        <Button onClick={submit} variant="contained" disabled={!files.length}>Subir</Button>
      </DialogActions>
    </Dialog>
  );
}