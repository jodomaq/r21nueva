# Sistema de Administración de Unidades Territoriales

Este sistema permite gestionar usuarios, unidades administrativas y sus asignaciones jerárquicas, sincronizado con la tabla `Seccion` de la base de datos.

## Estructura Implementada

### Backend

#### Modelos (`app/models.py`)
- **AdministrativeUnit**: Unidad territorial jerárquica con campos de sincronización:
  - `seccion_municipio_id`: Referencia al municipio en tabla Seccion
  - `seccion_distrito_id`: Referencia al distrito en tabla Seccion
  - Jerarquía: STATE → DISTRICT → MUNICIPALITY → SECTION

- **UserAssignment**: Asignaciones de usuarios con roles:
  1. Coordinador Estatal
  2. Delegado Regional
  3. Coordinador Distrital
  4. Coordinador Municipal
  5. Coordinador Seccional
  6. Presidente de Comité

#### Router de Administración (`app/routers/admin.py`)
**Acceso exclusivo para:** `jodomaq@gmail.com`

**Endpoints disponibles:**

##### Usuarios
- `GET /admin/users` - Listar todos los usuarios
- `POST /admin/users` - Crear nuevo usuario
- `DELETE /admin/users/{user_id}` - Eliminar usuario

##### Unidades Administrativas
- `GET /admin/administrative-units` - Listar unidades (con filtros)
  - Parámetros: `unit_type`, `parent_id`, `search`
- `GET /admin/administrative-units/{unit_id}` - Detalle de unidad

##### Asignaciones
- `GET /admin/assignments` - Listar asignaciones (con filtros)
  - Parámetros: `user_id`, `administrative_unit_id`, `role`
- `POST /admin/assignments` - Crear asignación
- `DELETE /admin/assignments/{assignment_id}` - Eliminar asignación

##### Secciones (solo lectura)
- `GET /admin/secciones` - Listar secciones
- `GET /admin/secciones/municipios` - Municipios únicos
- `GET /admin/secciones/distritos` - Distritos únicos

##### Estadísticas
- `GET /admin/stats` - Estadísticas del sistema

### Frontend

#### Componente AdminDashboard (`comites/src/components/AdminDashboard.jsx`)
Panel de administración con 3 pestañas:

1. **Usuarios**
   - Tabla con todos los usuarios
   - Crear nuevo usuario
   - Eliminar usuarios (excepto el admin)

2. **Unidades Administrativas**
   - Tabla filtrable por tipo
   - Búsqueda por nombre/código
   - Visualización de jerarquía
   - Contador de hijos y asignaciones

3. **Asignaciones**
   - Tabla de todas las asignaciones
   - Crear nueva asignación (usuario + unidad + rol)
   - Eliminar asignaciones
   - Visualización de roles con chips

#### Integración con AuthContext
- Detección automática de admin (`jodomaq@gmail.com`)
- Exposición de `isAdmin` en el contexto
- Botón de acceso al dashboard en el AppBar (solo para admin)

## Scripts de Inicialización

### 1. Migración de Base de Datos
```bash
cd backend
python scripts/add_sync_columns.py
```
Agrega las columnas `seccion_municipio_id` y `seccion_distrito_id` a la tabla `administrativeunit`.

### 2. Población de Unidades Administrativas
```bash
python scripts/populate_administrative_units.py
```

**Proceso:**
1. Crea el estado de Michoacán (código 16)
2. Lee distritos únicos de la tabla `Seccion`
3. Crea unidades DISTRICT vinculadas al estado
4. Lee municipios únicos y los vincula a sus distritos
5. Crea unidades SECTION (todas las secciones)

**Resultado esperado:**
- 1 Estado (Michoacán)
- 12 Distritos (según datos de Seccion)
- 113 Municipios (según datos de Seccion)
- 2734 Secciones (según datos de Seccion)

## Uso del Sistema

### 1. Iniciar Sesión como Administrador
1. Acceder a la aplicación `comites`
2. Iniciar sesión con `jodomaq@gmail.com`
3. Aparecerá el botón "Administración" en el AppBar

### 2. Crear Usuarios
1. Click en "Administración"
2. Pestaña "Usuarios"
3. Click "Nuevo Usuario"
4. Ingresar nombre y email
5. El usuario podrá iniciar sesión con ese email

### 3. Asignar Roles a Usuarios
1. Pestaña "Asignaciones"
2. Click "Nueva Asignación"
3. Seleccionar:
   - Usuario (autocompletado)
   - Unidad Administrativa (autocompletado)
   - Rol (lista desplegable)
4. Click "Crear"

### 4. Explorar Jerarquía
1. Pestaña "Unidades Administrativas"
2. Filtrar por tipo: Estado, Distrito, Municipio, Sección
3. Buscar por nombre o código
4. Ver contadores de hijos y asignaciones

## Sincronización con Tabla Seccion

Las unidades administrativas mantienen referencias a la tabla `Seccion`:

- **Distritos**: `seccion_distrito_id` apunta al ID del distrito en Seccion
- **Municipios**: 
  - `seccion_municipio_id` apunta al ID del municipio
  - `seccion_distrito_id` mantiene relación con su distrito
- **Secciones**: Ambos campos mantienen la trazabilidad

### Consultas de Sincronización

```python
# Obtener unidades de un municipio específico
units = session.exec(
    select(AdministrativeUnit).where(
        AdministrativeUnit.seccion_municipio_id == municipio_id
    )
).all()

# Obtener unidades de un distrito específico
units = session.exec(
    select(AdministrativeUnit).where(
        AdministrativeUnit.seccion_distrito_id == distrito_id
    )
).all()
```

## Seguridad

- **Autenticación**: OAuth2 con Google/Microsoft
- **Autorización**: Solo `jodomaq@gmail.com` puede acceder a `/admin/*`
- **Protección**: No se puede eliminar al usuario administrador
- **Validación**: Los endpoints verifican existencia de usuarios y unidades

## Mantenimiento

### Repoblar Unidades (si hay cambios en Seccion)
```bash
# Eliminar unidades existentes (cuidado!)
# Volver a ejecutar
python scripts/populate_administrative_units.py
```

### Backup de Asignaciones
Las asignaciones se almacenan en la tabla `userassignment` y están vinculadas a usuarios y unidades.

## Tecnologías Utilizadas

### Backend
- FastAPI
- SQLModel
- MySQL/PyMySQL
- Pydantic

### Frontend
- React
- Material-UI
- Axios
- React OAuth Google

## Flujo de Trabajo Típico

1. **Admin carga datos de Seccion** (archivo CSV/SQL)
2. **Admin ejecuta script de población** → Crea jerarquía automática
3. **Admin crea usuarios** en el dashboard
4. **Admin asigna roles** a usuarios en diferentes niveles:
   - Coordinador Estatal → Asignado al estado
   - Coordinador Distrital → Asignado a un distrito específico
   - Coordinador Municipal → Asignado a un municipio específico
5. **Usuarios inician sesión** y ven su alcance según su asignación
6. **Sistema mantiene trazabilidad** con datos originales de Seccion

## Notas Importantes

- La jerarquía se construye automáticamente desde los datos de Seccion
- Los campos `seccion_municipio_id` y `seccion_distrito_id` permiten consultas bidireccionales
- El rol 6 (Presidente de Comité) puede asignarse a nivel de sección
- Un usuario puede tener múltiples asignaciones en diferentes unidades
