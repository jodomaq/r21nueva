import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, TextField, Button, Grid, Paper, Typography, Stack, Tooltip, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import api from '../api';
import { useIneOcr } from '../hooks/useIneOcr';
import * as yup from 'yup';

export default function AddMember({ committeeId, onAdded, onCancel }) {
  const [form, setForm] = useState({
    full_name: '',
    ine_key: '',
    phone: '',
    email: '',
    section_number: '',
    invited_by: ''
  });
  const [committeeData, setCommitteeData] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  const { scanningIndex, scanDocument } = useIneOcr();

  const validationSchema = useMemo(
    () =>
      yup.object({
        full_name: yup.string().trim().required('Nombre completo es obligatorio'),
        phone: yup
          .string()
          .trim()
          .matches(/^\d{10}$/, 'Teléfono debe tener 10 dígitos')
          .required('Teléfono es obligatorio'),
        section_number: yup.string().trim().required('Sección es obligatoria'),
        invited_by: yup.string().trim().required('Invitado por es obligatorio')
      }),
    []
  );
  const setField = (k, v) => {
    setForm(prev => ({ ...prev, [k]: v }));
    setErrors(prev => ({ ...prev, [k]: undefined }));
  };

  // Cargar datos del comité al montar el componente
  useEffect(() => {
    const loadCommitteeData = async () => {
      try {
        const response = await api.get(`/committees/${committeeId}`);
        const committee = response.data;
        setCommitteeData(committee);

        // Rellenar automáticamente los campos con los datos del comité
        if (committee.section_number) {
          setForm(prev => ({ ...prev, section_number: String(committee.section_number) }));
        }
        if (committee.presidente) {
          setForm(prev => ({ ...prev, invited_by: committee.presidente }));
        }
      } catch (error) {
        console.error('Error cargando datos del comité:', error);
      }
    };

    if (committeeId) {
      loadCommitteeData();
    }
  }, [committeeId]);

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
    try {
      setErrors({});
      await validationSchema.validate(form, { abortEarly: false });
    } catch (validationError) {
      const fieldErrors = {};
      validationError.inner?.forEach(({ path, message }) => {
        if (path && !fieldErrors[path]) fieldErrors[path] = message;
      });
      setErrors(fieldErrors);
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
    <Paper sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={onCancel}>
          Cancelar
        </Button>
        <Typography variant="h6">Nuevo Integrante</Typography>
      </Stack>
      <Box component="form" onSubmit={submit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Nombre completo" value={form.full_name} onChange={e => setField('full_name', e.target.value)} error={Boolean(errors.full_name)} helperText={errors.full_name} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="INE" value={form.ine_key} onChange={e => setField('ine_key', e.target.value)} error={Boolean(errors.ine_key)} helperText={errors.ine_key} /></Grid>
          <Grid item xs={12} sm={4}><TextField fullWidth label="Teléfono" value={form.phone} onChange={e => setField('phone', e.target.value)} error={Boolean(errors.phone)} helperText={errors.phone} /></Grid>
          <Grid item xs={12} sm={4}><TextField fullWidth label="Email" type="email" value={form.email} onChange={e => setField('email', e.target.value)} error={Boolean(errors.email)} helperText={errors.email} /></Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              select
              fullWidth
              label="Sección"
              value={form.section_number}
              onChange={e => setField('section_number', e.target.value)}
              error={Boolean(errors.section_number)}
              helperText={errors.section_number}
              SelectProps={{ native: true }}
            >
              <option value=""></option>
              {sections.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={2}><TextField fullWidth label="Invitado por" value={form.invited_by} onChange={e => setField('invited_by', e.target.value)} error={Boolean(errors.invited_by)} helperText={errors.invited_by} /></Grid>
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
