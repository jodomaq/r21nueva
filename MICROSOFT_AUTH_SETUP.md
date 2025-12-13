# Configuración de Autenticación Microsoft (Hotmail/Outlook)

## Registro de la aplicación en Azure

1. Ve a [Azure Portal](https://portal.azure.com/)
2. Busca y selecciona "Azure Active Directory" o "Microsoft Entra ID"
3. En el menú lateral, selecciona "App registrations" (Registros de aplicaciones)
4. Haz clic en "New registration" (Nuevo registro)
5. Configura:
   - **Name**: Comités MORENA (o el nombre de tu aplicación)
   - **Supported account types**: Selecciona "Accounts in any organizational directory and personal Microsoft accounts"
   - **Redirect URI**: 
     - Platform: Single-page application (SPA)
     - URL: `http://localhost:5173` (para desarrollo) y tu URL de producción

6. Haz clic en "Register"

## Obtener credenciales

### Client ID
1. En la página de tu aplicación registrada, copia el **Application (client) ID**
2. Este es tu `MICROSOFT_CLIENT_ID`

### Client Secret (solo para backend)
1. En el menú lateral, ve a "Certificates & secrets"
2. Haz clic en "New client secret"
3. Agrega una descripción y selecciona la duración
4. Copia el **Value** (no el Secret ID) inmediatamente - solo se muestra una vez
5. Este es tu `MICROSOFT_CLIENT_SECRET`

### Tenant ID
1. En la página Overview de tu aplicación, copia el **Directory (tenant) ID**
2. Para permitir cuentas personales de Microsoft (Hotmail, Outlook.com), usa `common` en lugar del tenant ID

## Configurar permisos de API

1. En el menú lateral, ve a "API permissions"
2. Haz clic en "Add a permission"
3. Selecciona "Microsoft Graph"
4. Selecciona "Delegated permissions"
5. Agrega los siguientes permisos:
   - `User.Read` (para obtener información básica del usuario)
6. Haz clic en "Add permissions"

## Configurar URIs de redirección

1. Ve a "Authentication" en el menú lateral
2. En "Platform configurations", asegúrate de que tu SPA esté configurado
3. Agrega las siguientes URIs:
   - `http://localhost:5173` (desarrollo)
   - Tu URL de producción (ej: `https://tusitio.com`)
4. En "Implicit grant and hybrid flows", asegúrate de que NO estén marcadas las casillas (usamos PKCE para SPA)

## Variables de entorno

### Backend (.env)
```env
MICROSOFT_CLIENT_ID=tu_client_id_aquí
MICROSOFT_CLIENT_SECRET=tu_client_secret_aquí
MICROSOFT_TENANT_ID=common
```

### Frontend (.env)
```env
VITE_MICROSOFT_CLIENT_ID=tu_client_id_aquí
```

## Instalación de dependencias

### Backend
```bash
cd backend
pip install -r requirements.txt
```

### Frontend
```bash
cd comites
npm install
```

## Notas importantes

- El `MICROSOFT_TENANT_ID` debe ser `common` para permitir tanto cuentas organizacionales como personales (Hotmail, Outlook.com)
- Si solo quieres permitir cuentas de una organización específica, usa el Tenant ID de esa organización
- El Client Secret del backend debe mantenerse seguro y nunca exponerse en el frontend
- Las cuentas personales de Microsoft incluyen: @hotmail.com, @outlook.com, @live.com, etc.

## Flujo de autenticación

1. El usuario hace clic en "Iniciar sesión con Microsoft" en el frontend
2. Se abre una ventana popup de Microsoft para autenticación
3. El usuario ingresa sus credenciales de Hotmail/Outlook
4. Microsoft devuelve un access token al frontend
5. El frontend envía el access token al backend
6. El backend verifica el token con Microsoft Graph API
7. El backend crea o actualiza el usuario en la base de datos
8. El backend devuelve un JWT para sesiones posteriores

## Pruebas

1. Asegúrate de tener un usuario registrado en la tabla `Committee` con un email de Hotmail/Outlook
2. Inicia sesión con esa cuenta
3. Si todo está configurado correctamente, deberías poder acceder a la aplicación

## Solución de problemas comunes

### Error: "AADSTS50011: The reply URL specified in the request does not match"
- Verifica que la URL de redirección en Azure coincida exactamente con la URL de tu aplicación
- Asegúrate de agregar tanto la URL de desarrollo como la de producción

### Error: "Token de Microsoft inválido"
- Verifica que el Client ID en el frontend sea correcto
- Verifica que el token no haya expirado (los tokens tienen una duración limitada)

### Error: "Usuario no registrado"
- El email del usuario debe existir en la tabla `Committee` de la base de datos
- Verifica que el email en Azure coincida con el email en la base de datos


// ...existing code...

## Solución de problemas comunes

### Error: "La cuenta no existe en el inquilino"
Este error significa que tu aplicación está configurada solo para cuentas de una organización específica. Para permitir cuentas personales (Hotmail, Outlook, Live):

1. **Ve a Azure Portal** → Tu aplicación registrada
2. **En el menú lateral, selecciona "Authentication"**
3. **En "Supported account types"**, asegúrate de que esté seleccionado:
   - ✅ **"Accounts in any organizational directory and personal Microsoft accounts (e.g. Skype, Xbox)"**
   - ❌ NO selecciones solo "Accounts in this organizational directory only"

4. **Guarda los cambios**

5. **En tu backend `.env`**, asegúrate de usar:**
   ```env
   MICROSOFT_TENANT_ID=common
   ```
   **NO uses un GUID específico** (como `74658136-14ec-4630-ad9b-26e160ff0fc6`)

### Error: "AADSTS50011: The reply URL specified in the request does not match"
// ...existing code...