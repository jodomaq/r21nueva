import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Box, TextField, Button, Grid, MenuItem, Typography, Paper } from '@mui/material';
import api from '../api';

const schema = yup.object({
  name: yup.string().required(),
  section_number: yup.string().required(),
  type: yup.string().oneOf(['Maestros','Transportistas','Seccionales','Municipales','Deportistas']).required(),
  members: yup.array().of(yup.object({
    full_name: yup.string().required('Requerido'),
    ine_key: yup.string().required('Requerido'),
    phone: yup.string().required('Requerido'),
    email: yup.string().email().required('Requerido'),
    section_number: yup.string().required('Requerido'),
    invited_by: yup.string().required('Requerido')
  })).min(1).max(10)
});

export default function CommitteeForm({ onCreated }) {
  const { control, register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: '', section_number: '', type: 'Maestros', members: Array.from({length:10}, () => ({ full_name:'', ine_key:'', phone:'', email:'', section_number:'', invited_by:'' })) }
  });
  const { fields } = useFieldArray({ control, name: 'members' });

  const onSubmit = async (data) => {
    const trimmedMembers = data.members.filter(m => m.full_name || m.ine_key || m.phone || m.email);
    data.members = trimmedMembers.slice(0,10);
    try {
      const res = await api.post('/committees', data);
      onCreated && onCreated(res.data);
      reset();
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
          <Grid item xs={12}><Typography variant="subtitle1">Integrantes (hasta 10)</Typography></Grid>
          {fields.map((f, idx) => (
            <Grid item xs={12} key={f.id} sx={{ borderBottom: '1px solid #ccc', pb:2 }}>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={3}><TextField size="small" fullWidth label={`Nombre ${idx+1}`} {...register(`members.${idx}.full_name`)} /></Grid>
                <Grid item xs={12} sm={2}><TextField size="small" fullWidth label="INE" {...register(`members.${idx}.ine_key`)} /></Grid>
                <Grid item xs={12} sm={2}><TextField size="small" fullWidth label="Teléfono" {...register(`members.${idx}.phone`)} /></Grid>
                <Grid item xs={12} sm={2}><TextField size="small" fullWidth label="Email" {...register(`members.${idx}.email`)} /></Grid>
                <Grid item xs={12} sm={1}><TextField size="small" fullWidth label="Sección" {...register(`members.${idx}.section_number`)} /></Grid>
                <Grid item xs={12} sm={2}><TextField size="small" fullWidth label="Invitado por" {...register(`members.${idx}.invited_by`)} /></Grid>
              </Grid>
            </Grid>
          ))}
          <Grid item xs={12}><Button type="submit" variant="contained">Guardar Comité</Button></Grid>
        </Grid>
      </Box>
    </Paper>
  );
}