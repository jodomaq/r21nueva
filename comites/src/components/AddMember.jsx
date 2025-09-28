import React, { useMemo, useRef, useState } from 'react';
import { Box, TextField, Button, Grid, Paper, Typography, Stack, Tooltip, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import api from '../api';
import { useIneOcr } from '../hooks/useIneOcr';

export default function AddMember({ committeeId, onAdded, onCancel }) {
  const [form, setForm] = useState({
    full_name: '',
    ine_key: '',
    phone: '',
    email: '',
    section_number: '',
    invited_by: ''
  });
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  const { scanningIndex, scanDocument } = useIneOcr();

  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const sections = useMemo(() => Array.from({ length: 2734 }, (_, i) => String(i + 1)), []);
  const handleScanClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const onPickImage = async (ev) => {
    const file = ev.target.files?.[0];
    ev.target.value = '';
    if (!file) return;
    const data = await scanDocument(0, file);
    if (!data) return;
    if (data.full_name) setField('full_name', data.full_name);
    if (data.ine_key) setField('ine_key', data.ine_key);
    if (data.phone) setField('phone', data.phone);
    if (data.email) setField('email', data.email);
    if (data.section_number) setField('section_number', String(data.section_number));
  };
  const submit = async (e) => {
    e.preventDefault();
    // simple required validation
    if (!form.full_name || !form.ine_key || !form.phone || !form.email || !form.section_number || !form.invited_by) {
      alert('Completa todos los campos');
      return;
    }
    try {
      setSaving(true);
      await api.post(`/committees/${committeeId}/members`, form);
      onAdded && onAdded();
    } catch (e) {
      alert(e.response?.data?.detail || 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper sx={{ p:2 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb:2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={onCancel}>
          Cancelar
        </Button>
        <Typography variant="h6">Nuevo Integrante</Typography>
      </Stack>
      <Box component="form" onSubmit={submit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Nombre completo" value={form.full_name} onChange={e => setField('full_name', e.target.value)} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="INE" value={form.ine_key} onChange={e => setField('ine_key', e.target.value)} /></Grid>
          <Grid item xs={12} sm={4}><TextField fullWidth label="Teléfono" value={form.phone} onChange={e => setField('phone', e.target.value)} /></Grid>
          <Grid item xs={12} sm={4}><TextField fullWidth label="Email" type="email" value={form.email} onChange={e => setField('email', e.target.value)} /></Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              select
              fullWidth
              label="Sección"
              value={form.section_number}
              onChange={e => setField('section_number', e.target.value)}
              SelectProps={{ native: true }}
            >
              <option value="">Selecciona sección</option>
              {sections.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={2}><TextField fullWidth label="Invitado por" value={form.invited_by} onChange={e => setField('invited_by', e.target.value)} /></Grid>
          <Grid item xs={12} sm={2}>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={onPickImage}
            />
            <Tooltip title="Escanear identificación">
              <span>
                <Button
                  variant="outlined"
                  startIcon={scanningIndex === 0 ? <CircularProgress size={18} /> : <PhotoCameraIcon />}
                  onClick={handleScanClick}
                  disabled={scanningIndex === 0}
                  sx={{ padding: '7px' }}
                >
                  {scanningIndex === 0 ? 'Procesando…' : ''}
                </Button>
              </span>
            </Tooltip>
          </Grid>
          <Grid item xs={12}>
            <Stack direction="row" spacing={2}>
              <Button type="submit" variant="contained" disabled={saving}>Añadir</Button>
              <Button variant="outlined" onClick={onCancel} disabled={saving}>Cancelar</Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}
