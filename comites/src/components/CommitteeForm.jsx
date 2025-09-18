import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Box, TextField, Button, Grid, MenuItem, Typography, Paper, Card, CardHeader, CardContent, CardActions, IconButton, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
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
  type: yup.string().oneOf(['Maestros','Transportistas','Seccionales','Municipales','Deportistas']).required('Requerido'),
  members: yup
    .array()
    .of(memberSchema)
    .min(1, 'Agrega al menos un integrante')
});

export default function CommitteeForm({ onCreated }) {
  const { control, register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      section_number: '',
      type: 'Maestros',
      members: [{ full_name:'', ine_key:'', phone:'', email:'', section_number:'', invited_by:'' }]
    }
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'members' });

  const onSubmit = async (data) => {
    // Filtrar integrantes completamente vacíos antes de enviar
    const hasAnyValue = (m) => Object.values(m || {}).some(v => !!(v && String(v).trim() !== ''));
    data.members = (data.members || []).filter(hasAnyValue);
    try {
      const res = await api.post('/committees', data);
      onCreated && onCreated(res.data);
      reset({ name: '', section_number: '', type: 'Maestros', members: [{ full_name:'', ine_key:'', phone:'', email:'', section_number:'', invited_by:'' }] });
    } catch (e) { alert('Error al crear: ' + (e.response?.data?.detail || '')); }
  };

  return (
    <Paper sx={{ p:2 }}>
      <Typography variant="h6" gutterBottom>Nuevo Comité</Typography>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Nombre del Comité" {...register('name')} error={!!errors.name} helperText={errors.name?.message} /></Grid>
          <Grid item xs={12} sm={3}><TextField fullWidth label="Sección" {...register('section_number')} error={!!errors.section_number} /></Grid>
          <Grid item xs={12} sm={3}>
            <TextField select fullWidth label="Tipo" {...register('type')}>
              {['Maestros','Transportistas','Seccionales','Municipales','Deportistas'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
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
                    <Grid item xs={12} sm={2}>
                      <TextField size="small" fullWidth label="Teléfono" {...register(`members.${idx}.phone`)} />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField size="small" fullWidth label="Email" {...register(`members.${idx}.email`)} />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <TextField size="small" fullWidth label="Sección" {...register(`members.${idx}.section_number`)} />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField size="small" fullWidth label="Invitado por" {...register(`members.${idx}.invited_by`)} />
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