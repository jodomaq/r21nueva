import React from 'react';
import { Box, Card, LinearProgress, Typography, Grid, Chip } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export default function InfoBar({ committeesCount = 0, promotedCount = 0 }) {
  // Calcular el porcentaje de avance (considerando 10 como máximo para el porcentaje)
  const progressPercentage = Math.min((committeesCount / 10) * 100, 100);

  // Determinar el color del semáforo basado en la cantidad de comités
  const getProgressColor = () => {
    if (committeesCount <= 5) return '#f44336'; // Rojo
    if (committeesCount <= 10) return '#ff9800'; // Amarillo
    return '#4caf50'; // Verde
  };

  // Determinar el label del semáforo
  const getProgressLabel = () => {
    if (committeesCount <= 5) return 'Bajo';
    if (committeesCount <= 10) return 'Medio';
    return 'Alto';
  };

  const progressColor = getProgressColor();
  const progressLabel = getProgressLabel();

  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)',
        borderRadius: 2,
        p: 2,
        mb: 3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0',
      }}
    >
      <Grid container spacing={3} alignItems="center">
        {/* Comités */}
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                background: '#8b1e3f',
                borderRadius: '50%',
                p: 1.5,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <GroupsIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#666', fontWeight: 500 }}>
                Comités
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
                {committeesCount}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Promovidos */}
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                background: '#ff9800',
                borderRadius: '50%',
                p: 1.5,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <EmojiEventsIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#666', fontWeight: 500 }}>
                Promovidos
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
                {promotedCount}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Barra de Progreso */}
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#666', fontWeight: 500 }}>
                  Avance
                </Typography>
                <Chip
                  label={progressLabel}
                  size="small"
                  sx={{
                    background: progressColor,
                    color: 'white',
                    fontWeight: 'bold',
                    height: 24,
                  }}
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={progressPercentage}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    backgroundColor: progressColor,
                    transition: 'all 0.3s ease',
                  },
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#999', fontSize: '0.7rem' }}>
                  1-5 (Rojo)
                </Typography>
                <Typography variant="caption" sx={{ color: '#999', fontSize: '0.7rem' }}>
                  5-10 (Amarillo)
                </Typography>
                <Typography variant="caption" sx={{ color: '#999', fontSize: '0.7rem' }}>
                  10+ (Verde)
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                background: progressColor,
                borderRadius: '50%',
                p: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minWidth: 48,
                minHeight: 48,
              }}
            >
              <TrendingUpIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Card>
  );
}
