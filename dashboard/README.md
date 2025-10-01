# Dashboard R21 MORENA Michoacán

Aplicación React (Vite) que consume el backend `backend/` para mostrar el tablero estratégico del Segundo Piso de la Cuarta Transformación en Michoacán.

## Requerimientos

- Node.js 18+
- Backend FastAPI corriendo y accesible (ver carpeta `backend/`).

## Variables de entorno

Configura el archivo `.env` (o usa variables de entorno del sistema) con la URL del backend:

```
VITE_API_BASE_URL=http://localhost:8000
```

## Instalación

```powershell
npm install
```

## Scripts disponibles

```powershell
npm run dev      # Servidor de desarrollo (http://localhost:5173)
npm run build    # Build de producción en dist/
npm run preview  # Vista previa del build
```

## Funcionalidades destacadas

- Métricas en tiempo real de comités, promovidos, municipios y secciones cubiertas.
- Gráficas (Recharts) por responsable, tipo de comité y municipio.
- Mapa de reuniones generado con Leaflet.
- Árbol jerárquico de `AdministrativeUnit` y tabla de roles (`UserAssignment`).
- Explorador de comités con impresión de actas PDF y enlaces a WhatsApp.
- Exportación a Excel del padrón de comités e integrantes.
- Galería de documentos y listado de presidentes.

## Datos consumidos

Todos los endpoints provienen del backend en `/dashboard/*` (ver README del backend para los detalles). Asegúrate de habilitar CORS en FastAPI (`FRONTEND_ORIGIN` en el `.env`).
