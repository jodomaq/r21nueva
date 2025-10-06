import React, { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Box, TextField, Button, Grid, MenuItem, Typography, Paper } from '@mui/material';
import api from '../api';

// Esquema para un integrante: permite vacío (todos los campos sin llenar),
// pero si se llena alguno, entonces todos se vuelven requeridos.
const schema = yup.object({
  name: yup.string().required('Requerido'),
  section_number: yup.string().required('Requerido'),
  type: yup.string().required('Requerido'),
  presidente: yup.string().required('Requerido'),
  email: yup.string().email('Email inválido').required('Requerido'),
  clave_afiliacion: yup.string().required('Requerido').max(13, 'Máximo 13 caracteres'),
  telefono: yup.string().trim().matches(/^\d{10}$/, 'Teléfono debe tener 10 dígitos').required('Teléfono es obligatorio')
});

export default function CommitteeForm({ onCreated }) {
  const [types, setTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [typesError, setTypesError] = useState('');
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      section_number: '',
      type: '',
      presidente: '',
      email: '',
      clave_afiliacion: '',
      telefono: ''
    }
  });
  // Load types on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingTypes(true);
        const { data } = await api.get('/committee-types');
        if (!mounted) return;
        const active = (data || []).filter(t => t.is_active !== false);
        setTypes(active);
        if (active.length > 0) {
          // set default type to first
          setValue('type', active[0].name, { shouldValidate: true });
        }
      } catch (e) {
        console.error(e);
        setTypesError('No se pudieron cargar los tipos');
      } finally {
        if (mounted) setLoadingTypes(false);
      }
    })();
    return () => { mounted = false; };
  }, [reset]);

  // Nueva lista de secciones 1..2734
  const sections = useMemo(() => Array.from({ length: 2734 }, (_, i) => String(i + 1)), []);

  const onSubmit = async (data) => {
    const payload = {
      name: data.name,
      section_number: data.section_number,
      type: data.type,
      presidente: data.presidente,
      email: data.email,
      clave_afiliacion: data.clave_afiliacion,
      telefono: data.telefono,
      members: []
    };
    try {
      const res = await api.post('/committees', payload);
      onCreated && onCreated(res.data);
      const defaultType = types[0]?.name || '';
      reset({
        name: '',
        section_number: '',
        type: defaultType,
        presidente: '',
        email: '',
        clave_afiliacion: '',
        telefono: ''
      });
    } catch (e) { alert('Error al crear: ' + (e.response?.data?.detail || '')); }
  };

  return (
    <Paper sx={{ p:2 }}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Nombre del comité" {...register('name')} error={!!errors.name} helperText={errors.name?.message} /></Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              select
              fullWidth
              SelectProps={{ native: true }}
              {...register('section_number')}
              error={!!errors.section_number}
            >
              <option value="">Selecciona sección</option>
              {sections.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField select fullWidth label="Tipo" {...register('type')} disabled={loadingTypes || types.length === 0}
              error={!!errors.type}
              helperText={errors.type?.message || (typesError || (loadingTypes ? 'Cargando tipos...' : (types.length === 0 ? 'No hay tipos disponibles' : '')))}
            >
              {types.map(t => (
                <MenuItem key={t.id} value={t.name}>{t.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Nombre del presidente" {...register('presidente')} error={!!errors.presidente} helperText={errors.presidente?.message} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Email del presidente" type="email" {...register('email')} error={!!errors.email} helperText={errors.email?.message} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Clave de afiliación" {...register('clave_afiliacion')} error={!!errors.clave_afiliacion} helperText={errors.clave_afiliacion?.message} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Teléfono" {...register('telefono')} error={!!errors.telefono} helperText={errors.telefono?.message} /></Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained">Guardar Comité</Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}