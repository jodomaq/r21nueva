import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Alert,
  Chip,
  Grid,
  Card,
  CardContent,
  Autocomplete,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  AccountTree as TreeIcon,
  Assignment as AssignmentIcon,
  Map as MapIcon,
} from '@mui/icons-material';
import api from '../api';

const ROLE_NAMES = {
  1: 'Coordinador Estatal',
  2: 'Delegado Regional',
  3: 'Coordinador Distrital',
  4: 'Coordinador Municipal',
  5: 'Coordinador Seccional',
  6: 'Presidente de Comité'
};

const UNIT_TYPE_NAMES = {
  'STATE': 'Estado',
  'REGION': 'Región',
  'DISTRICT': 'Distrito',
  'MUNICIPALITY': 'Municipio',
  'SECTION': 'Sección',
  'Region':'Administrador',
};

export default function AdminDashboard() {
  const [currentTab, setCurrentTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [units, setUnits] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Dialogs
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openAssignmentDialog, setOpenAssignmentDialog] = useState(false);

  // Forms
  const [newUser, setNewUser] = useState({ email: '', name: '', phone: '' });
  const [newAssignment, setNewAssignment] = useState({
    user_id: '',
    administrative_unit_id: '',
    role: ''
  });

  // Filters
  const [unitTypeFilter, setUnitTypeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
    loadStats();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, unitsRes, assignmentsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/administrative-units'),
        api.get('/admin/assignments')
      ]);
      setUsers(usersRes.data);
      setUnits(unitsRes.data);
      setAssignments(assignmentsRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleCreateUser = async () => {
    try {
      await api.post('/admin/users', newUser);
      setSuccess('Usuario creado exitosamente');
      setOpenUserDialog(false);
      setNewUser({ email: '', name: '', phone: '' });
      loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al crear usuario');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('¿Está seguro de eliminar este usuario y todas sus asignaciones?')) {
      return;
    }
    try {
      await api.delete(`/admin/users/${userId}`);
      setSuccess('Usuario eliminado exitosamente');
      loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al eliminar usuario');
    }
  };

  const handleCreateAssignment = async () => {
    try {
      await api.post('/admin/assignments', newAssignment);
      setSuccess('Asignación creada exitosamente');
      setOpenAssignmentDialog(false);
      setNewAssignment({ user_id: '', administrative_unit_id: '', role: '' });
      loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al crear asignación');
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!confirm('¿Está seguro de eliminar esta asignación?')) {
      return;
    }
    try {
      await api.delete(`/admin/assignments/${assignmentId}`);
      setSuccess('Asignación eliminada exitosamente');
      loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al eliminar asignación');
    }
  };

  const filteredUnits = units.filter(unit => {
    const matchesType = !unitTypeFilter || unit.unit_type === unitTypeFilter;
    const matchesSearch = !searchTerm || 
      unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.code?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Panel de Administración
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gestión de usuarios, unidades administrativas y asignaciones
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Statistics */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="primary" />
                  <Box>
                    <Typography variant="h4">{stats.total_users}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Usuarios
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TreeIcon color="success" />
                  <Box>
                    <Typography variant="h4">{stats.total_administrative_units}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Unidades Administrativas
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssignmentIcon color="warning" />
                  <Box>
                    <Typography variant="h4">{stats.total_assignments}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Asignaciones
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MapIcon color="info" />
                  <Box>
                    <Typography variant="h4">{stats.total_secciones}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Secciones
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)}>
          <Tab label="Usuarios" />
          <Tab label="Unidades Administrativas" />
          <Tab label="Asignaciones" />
        </Tabs>
      </Paper>

      {/* Tab Content: Users */}
      {currentTab === 0 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Usuarios del Sistema</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadData}
              >
                Actualizar
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenUserDialog(true)}
              >
                Nuevo Usuario
              </Button>
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Fecha de Creación</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.email === 'jodomaq@gmail.com'}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Tab Content: Administrative Units */}
      {currentTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Unidades Administrativas</Typography>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadData}
            >
              Actualizar
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Tipo de Unidad</InputLabel>
              <Select
                value={unitTypeFilter}
                label="Tipo de Unidad"
                onChange={(e) => setUnitTypeFilter(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="STATE">Estado</MenuItem>
                <MenuItem value="DISTRICT">Distrito</MenuItem>
                <MenuItem value="MUNICIPALITY">Municipio</MenuItem>
                <MenuItem value="SECTION">Sección</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              label="Buscar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flexGrow: 1 }}
            />
          </Box>

          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Código</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Padre</TableCell>
                  <TableCell align="center">Hijos</TableCell>
                  <TableCell align="center">Asignaciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUnits.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell>{unit.id}</TableCell>
                    <TableCell>{unit.name}</TableCell>
                    <TableCell>{unit.code || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={UNIT_TYPE_NAMES[unit.unit_type]}
                        size="small"
                        color={
                          unit.unit_type === 'STATE' ? 'primary' :
                          unit.unit_type === 'DISTRICT' ? 'success' :
                          unit.unit_type === 'MUNICIPALITY' ? 'warning' :
                          'default'
                        }
                      />
                    </TableCell>
                    <TableCell>{unit.parent_name || '-'}</TableCell>
                    <TableCell align="center">{unit.children_count}</TableCell>
                    <TableCell align="center">{unit.assignments_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Tab Content: Assignments */}
      {currentTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Asignaciones de Usuarios</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadData}
              >
                Actualizar
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenAssignmentDialog(true)}
              >
                Nueva Asignación
              </Button>
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Unidad Administrativa</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>{assignment.id}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{assignment.user_name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {assignment.user_email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{assignment.unit_name}</TableCell>
                    <TableCell>
                      <Chip
                        label={UNIT_TYPE_NAMES[assignment.unit_type]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={assignment.role_name}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(assignment.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDeleteAssignment(assignment.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Dialog: New User */}
      <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)}>
        <DialogTitle>Crear Nuevo Usuario</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Nombre"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Teléfono (opcional)"
            type="tel"
            value={newUser.phone}
            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
            placeholder="10 dígitos"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUserDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleCreateUser}
            disabled={!newUser.name || !newUser.email}
          >
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: New Assignment */}
      <Dialog open={openAssignmentDialog} onClose={() => setOpenAssignmentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Nueva Asignación</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <Autocomplete
              options={users}
              getOptionLabel={(option) => `${option.name} (${option.email})`}
              value={users.find(u => u.id === newAssignment.user_id) || null}
              onChange={(e, value) => setNewAssignment({ ...newAssignment, user_id: value?.id || '' })}
              renderInput={(params) => <TextField {...params} label="Usuario" />}
            />
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <Autocomplete
              options={units}
              getOptionLabel={(option) => `${option.name} (${UNIT_TYPE_NAMES[option.unit_type]})`}
              value={units.find(u => u.id === newAssignment.administrative_unit_id) || null}
              onChange={(e, value) => setNewAssignment({ ...newAssignment, administrative_unit_id: value?.id || '' })}
              renderInput={(params) => <TextField {...params} label="Unidad Administrativa" />}
            />
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Rol</InputLabel>
            <Select
              value={newAssignment.role}
              label="Rol"
              onChange={(e) => setNewAssignment({ ...newAssignment, role: e.target.value })}
            >
              {Object.entries(ROLE_NAMES).map(([id, name]) => (
                <MenuItem key={id} value={parseInt(id)}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignmentDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleCreateAssignment}
            disabled={!newAssignment.user_id || !newAssignment.administrative_unit_id || !newAssignment.role}
          >
            Crear
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
