import React, { useEffect, useState, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Box, TextField, Button, Grid, MenuItem, Typography, Paper, Card, CardHeader, CardContent, CardActions, IconButton, Divider, CircularProgress, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import api from '../api';

// Esquema para un integrante: permite vacío (todos los campos sin llenar),
// pero si se llena alguno, entonces todos se vuelven requeridos.
const memberSchema = yup
  .object({
    full_name: yup.string().trim(),
    ine_key: yup.string().trim(),
    phone: yup.string().trim(),
    email: yup.string().trim().email('Email inválido'),
    section_number: yup.string().trim(),
    invited_by: yup.string().trim()
  })
  .test(
    'completo-o-vacio',
    'Completa todos los campos del integrante o elimínalo.',
    (value) => {
      if (!value) return true;
      const values = Object.values(value);
      const hasAny = values.some((v) => !!(v && String(v).trim() !== ''));
      const hasAll = ['full_name','ine_key','phone','email','section_number','invited_by']
        .every((k) => value[k] && String(value[k]).trim() !== '');
      return !hasAny || hasAll;
    }
  );

const schema = yup.object({
  name: yup.string().required('Requerido'),
  section_number: yup.string().required('Requerido'),
  type: yup.string().required('Requerido'),
  members: yup
    .array()
    .of(memberSchema)
    .min(1, 'Agrega al menos un integrante')
});

export default function CommitteeForm({ onCreated }) {
  const [types, setTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [typesError, setTypesError] = useState('');
  const [scanningIdx, setScanningIdx] = useState(null);
  const { control, register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      section_number: '',
      type: '',
      members: [{ full_name:'', ine_key:'', phone:'', email:'', section_number:'', invited_by:'' }]
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
  const { fields, append, remove } = useFieldArray({ control, name: 'members' });

  // Nueva lista de secciones 1..2734
  const sections = useMemo(() => Array.from({ length: 2734 }, (_, i) => String(i + 1)), []);

  const onSubmit = async (data) => {
    // Filtrar integrantes completamente vacíos antes de enviar
    const hasAnyValue = (m) => Object.values(m || {}).some(v => !!(v && String(v).trim() !== ''));
    data.members = (data.members || []).filter(hasAnyValue);
    try {
      const res = await api.post('/committees', data);
      onCreated && onCreated(res.data);
      const defaultType = types[0]?.name || '';
      reset({ name: '', section_number: '', type: defaultType, members: [{ full_name:'', ine_key:'', phone:'', email:'', section_number:'', invited_by:'' }] });
    } catch (e) { alert('Error al crear: ' + (e.response?.data?.detail || '')); }
  };

  const fileInputsRef = React.useRef({});

  const handleScanClick = (idx) => {
    const input = fileInputsRef.current[idx];
    if (input) input.click();
  };

  const onPickImage = async (idx, ev) => {
    const file = ev.target.files?.[0];
    ev.target.value = '';
    if (!file) return;
    try {
      setScanningIdx(idx);
      const form = new FormData();
      form.append('file', file);
      const { data } = await api.post('/ocr/ine', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (data) {
        if (data.full_name) setValue(`members.${idx}.full_name`, data.full_name);
        if (data.ine_key) setValue(`members.${idx}.ine_key`, data.ine_key);
        if (data.phone) setValue(`members.${idx}.phone`, data.phone);
        if (data.email) setValue(`members.${idx}.email`, data.email);
        if (data.section_number) setValue(`members.${idx}.section_number`, String(data.section_number));
      }
    } catch (e) {
      console.error(e);
      alert('No se pudo procesar la imagen: ' + (e.response?.data?.detail || e.message));
    } finally {
      setScanningIdx(null);
    }
  };

  return (
    <Paper sx={{ p:2 }}>
      <Typography variant="h6" gutterBottom>Nuevo Comité</Typography>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Presidente del comité: " {...register('name')} error={!!errors.name} helperText={errors.name?.message} /></Grid>
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
          <Grid item xs={12}><Typography variant="subtitle1">Integrantes</Typography></Grid>
          {fields.map((f, idx) => (
            <Grid item xs={12} key={f.id}>
              <Card variant="outlined">
                <CardHeader
                  title={`Integrante ${idx + 1}`}
                  action={
                    <IconButton aria-label="Eliminar"
                      onClick={() => remove(idx)}
                      disabled={fields.length === 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={3}>
                      <TextField size="small" fullWidth label="Nombre completo" {...register(`members.${idx}.full_name`)} />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField size="small" fullWidth label="INE" {...register(`members.${idx}.ine_key`)} />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <TextField size="small" fullWidth label="Teléfono" {...register(`members.${idx}.phone`)} />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField size="small" fullWidth label="Email" {...register(`members.${idx}.email`)} />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <TextField
                        size="small"
                        select
                        fullWidth
                        SelectProps={{ native: true }}
                        {...register(`members.${idx}.section_number`)}
                      >
                        <option value="">Selecciona sección</option>
                        {sections.map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField size="small" fullWidth label="Invitado por" {...register(`members.${idx}.invited_by`)} />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        style={{ display: 'none' }}
                        ref={el => (fileInputsRef.current[idx] = el)}
                        onChange={(e) => onPickImage(idx, e)}
                      />
                      <Tooltip title="Escanear identificación">
                        <span>
                          <Button
                            variant="outlined"
                            startIcon={scanningIdx === idx ? <CircularProgress size={18} /> : <PhotoCameraIcon />}
                            onClick={() => handleScanClick(idx)}
                            disabled={scanningIdx === idx}
                            size="large"
                            sx={{ padding: '7px' }}
                            align="center"
                          >
                            {scanningIdx === idx ? 'Procesando…' : ''}
                          </Button>
                        </span>
                      </Tooltip>
                    </Grid>
                  </Grid>
                  {errors.members?.[idx]?.message && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                      {errors.members[idx].message}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => append({ full_name:'', ine_key:'', phone:'', email:'', section_number:'', invited_by:'' })}>
              Agregar integrante
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained">Guardar Comité</Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}