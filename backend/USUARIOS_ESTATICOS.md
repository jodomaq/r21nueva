# Gestión de Usuarios Estáticos para Autenticación

Este documento explica cómo agregar usuarios para autenticación con nombre de usuario y contraseña.

## Ubicación

Los usuarios estáticos se encuentran en el archivo `app/auth.py`, en la constante `STATIC_USERS` (línea 19).

## Formato

```python
STATIC_USERS = {
    "nombre_usuario": ("contraseña", "email@example.com", "Nombre Completo"),
    # Agregar más usuarios aquí
}
```

## Ejemplo de Uso

Para agregar un nuevo usuario:

1. Abre el archivo `d:\DEV\r21nueva\backend\app\auth.py`
2. Localiza la constante `STATIC_USERS` (línea 19)
3. Agrega una nueva línea con el formato:
   ```python
   "usuario_nuevo": ("contraseña123", "usuario@email.com", "Nombre Usuario"),
   ```

### Ejemplo completo:

```python
STATIC_USERS = {
    "admin": ("admin123", "admin@plataformar21.mx", "Administrador"),
    "jodomaq": ("password123", "jodomaq@gmail.com", "José Domínguez"),
    "karinarojas": ("karina2024", "karinarojas2597@gmail.com", "Karina Rojas"),
    "raul_moron": ("raul2024", "raul_moron_orozco@hotmail.com", "Raúl Morón"),
}
```

## Requisitos Importantes

⚠️ **IMPORTANTE**: El email del usuario debe estar registrado previamente en la tabla `Committee` o `User` de la base de datos. El sistema verifica esto antes de permitir el acceso.

## Notas de Seguridad

- 🔒 Este método es adecuado para un número limitado de usuarios
- 🔒 Las contraseñas se almacenan en texto plano en el código (solo para desarrollo/uso interno)
- 🔒 Para producción con muchos usuarios, se recomienda implementar un sistema de autenticación con hash de contraseñas
- 🔒 No versionar contraseñas reales en repositorios públicos

## Verificación

Después de agregar un usuario, reinicia el servidor backend para que los cambios surtan efecto:

```bash
# Desde el directorio backend
uvicorn app.main:app --reload
```

## Inicio de Sesión

Los usuarios pueden iniciar sesión desde el frontend usando:
- **Usuario**: El nombre de usuario definido en STATIC_USERS
- **Contraseña**: La contraseña correspondiente

El sistema también soporta autenticación con:
- Google OAuth
- Microsoft OAuth
