import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, ImageList, ImageListItem, Typography, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import api from '../api';

export default function DocumentUploadDialog({ committee, onClose }) {
  const [baseURL, setBaseURL] = useState('http://localhost:8000');

  const isLocalhost = typeof window !== 'undefined' && ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
  const [files, setFiles] = useState([]);
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    setBaseURL(isLocalhost ? 'http://localhost:8000' : import.meta.env.VITE_API_BASE);
  }, [isLocalhost]);

  const loadDocs = async () => {
    const { data } = await api.get(`/committees/${committee.id}/documents`);
    setDocs(data);
  };
  useEffect(() => { loadDocs(); }, [committee.id]);

  const submit = async () => {
    const form = new FormData();
    files.forEach(f => form.append('files', f));
    try {
      await api.post(`/committees/${committee.id}/documents`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFiles([]);
      await loadDocs();
    } catch (e) {
      alert(e.response?.data?.detail || 'Error al subir los archivos.');
    }
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

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const validFiles = selectedFiles.filter(file => {
      if (file.type.startsWith("image/") || file.type === "application/pdf") {
        return true;
      }
      return false;
    });

    if (validFiles.length !== selectedFiles.length) {
      alert("Algunos archivos fueron ignorados. Solo se permiten imágenes y archivos PDF.");
    }
    
    setFiles(validFiles);
  };

  const renderDoc = (doc) => {
    const docUrl = `${baseURL}/api/uploads/${doc.filename}`;
    if (doc.content_type === 'application/pdf') {
      return (
        <a href={docUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            minHeight: '120px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            textAlign: 'center',
            padding: '8px'
          }}>
            <PictureAsPdfIcon sx={{ fontSize: 40, mb: 1, color: 'error.main' }} />
            <Typography variant="caption" sx={{ wordBreak: 'break-all', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {doc.original_name}
            </Typography>
          </Box>
        </a>
      );
    }
    // It's an image
    return <img src={docUrl} alt={doc.original_name} loading="lazy" style={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: '4px' }} />;
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Documentos de {committee.name}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 1 }}>Presidente: {committee.presidente || '—'} · Correo: {committee.email || '—'}</Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>Clave afiliación: {committee.clave_afiliacion || '—'} · Teléfono: {committee.telefono || '—'}</Typography>
        <Box sx={{ display:'flex', flexDirection:'column', gap:2 }}>
          <input type="file" accept="image/*,application/pdf" multiple onChange={handleFileChange} />
          {files.length > 0 && <Typography>{files.length} archivo(s) listo(s) para subir.</Typography>}
          
          <Typography variant="subtitle2" sx={{ mt: 2 }}>Documentos adjuntos:</Typography>
          {docs.length === 0 && <Typography variant="body2" color="text.secondary">No hay documentos adjuntos.</Typography>}
          <ImageList cols={3} gap={8}>
            {docs.map(d => (
              <ImageListItem key={d.id} sx={{ position: 'relative' }}>
                {renderDoc(d)}
                <Box sx={{ position: 'absolute', top: 0, right: 0, background:'rgba(255,255,255,0.7)', borderRadius:'50%' }}>
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
        <Button onClick={submit} variant="contained" disabled={!files.length}>Subir Archivos</Button>
      </DialogActions>
    </Dialog>
  );
}