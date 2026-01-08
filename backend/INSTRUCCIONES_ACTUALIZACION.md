# INSTRUCCIONES DE ACTUALIZACIÓN EN PRODUCCIÓN

## Archivos modificados que debes copiar:

### Backend:
1. `backend/app/schemas.py` - Schema actualizado con validadores
2. `backend/app/routers/committees.py` - Endpoint con mejor manejo de errores
3. `backend/migrate_mariadb_optional_fields.py` - Script de migración

## Pasos a ejecutar:

### 1. Backup de la base de datos
```bash
mysqldump -u usuario -p r21db25 > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Copiar archivos al servidor
```bash
# Copiar los 3 archivos mencionados arriba
scp backend/app/schemas.py usuario@servidor:/ruta/backend/app/
scp backend/app/routers/committees.py usuario@servidor:/ruta/backend/app/routers/
scp backend/migrate_mariadb_optional_fields.py usuario@servidor:/ruta/backend/
```

### 3. Ejecutar migración de base de datos
```bash
cd /ruta/backend
python migrate_mariadb_optional_fields.py
```

Salida esperada:
```
======================================================================
MIGRACIÓN: Campos opcionales ine_key y email
======================================================================
Conectando a MariaDB: localhost:3306/r21db25
✓ Conexión establecida

📊 Estado actual de las columnas:
   ine_key: varchar(255) - ✗ Es obligatorio
   email: varchar(255) - ✗ Es obligatorio

🔄 Iniciando migración para 2 columna(s)...
   Modificando ine_key...
   ✓ ine_key ahora es opcional
   Modificando email...
   ✓ email ahora es opcional

✅ Migración completada exitosamente!
```

### 4. Reiniciar el servicio backend
```bash
sudo systemctl restart uvicorn
# O el nombre de tu servicio
```

### 5. Verificar que funciona
Intenta agregar un miembro sin INE ni email. Ahora debería funcionar correctamente.

## Cambios realizados:

### schemas.py
- ✅ Agregado `field_validator` para `ine_key` y `email`
- ✅ Los validadores convierten cadenas vacías ("") a None
- ✅ Email ya no requiere ser EmailStr válido si está vacío

### routers/committees.py
- ✅ Agregado try-except en el endpoint add_member
- ✅ Ahora captura y devuelve errores detallados
- ✅ Los errores de validación se mostrarán en el navegador

### Base de datos (migrate_mariadb_optional_fields.py)
- ✅ Modifica columnas ine_key y email para permitir NULL
- ✅ Incluye verificación de estado actual
- ✅ Rollback automático si hay errores

## Qué esperar después de la actualización:

Ahora podrás agregar miembros:
- ✅ Con todos los campos (incluidos INE y email)
- ✅ Sin INE (dejándolo vacío)
- ✅ Sin email (dejándolo vacío)
- ✅ Sin ambos campos

Si hay algún error, ahora verás el mensaje detallado en lugar de solo "[object Object]"
