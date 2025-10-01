# Backend FastAPI - Comités MORENA

## Requisitos
- Python 3.11+

## Instalación
Crear entorno virtual (opcional) e instalar dependencias:

```
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
```

## Variables de entorno (.env)
```
GOOGLE_CLIENT_ID=TU_CLIENT_ID_DE_CONSOLa_GOOGLE
JWT_SECRET=cadena-segura
FRONTEND_ORIGIN=http://localhost:5173
UPLOAD_DIR=uploads
DATABASE_URL=sqlite:///./committees.db
```

## Ejecutar
```
uvicorn app.main:app --reload --port 8000
```

## Endpoints Principales
- POST /auth/google  (body: {"id_token": "..."})
- POST /committees
- GET /committees
- GET /committees/{id}
- POST /committees/{id}/members
- DELETE /committees/{id}/members/{member_id}
- POST /committees/{id}/documents (multipart/form-data files[])
- GET /committees/{id}/documents
- GET /uploads/... (archivos estáticos)

## Endpoints para el dashboard
- GET /dashboard/attendance — listado de asistencias (modelo `Attendance`)
- GET /dashboard/attendance/map — coordenadas para mapa de reuniones
- GET /dashboard/committee-stats — totales por usuario, sección, municipio y tipo de comité
- GET /dashboard/administrative-tree — árbol jerárquico de `AdministrativeUnit`
- GET /dashboard/user-assignments — responsables y roles (`UserAssignment`)
- GET /dashboard/committees — listado completo de comités con integrantes y documentos
- GET /dashboard/committees/{id} — detalle de comité con integrantes y acta
- GET /dashboard/documents — galería global de documentos
- GET /dashboard/metrics — métricas agregadas (comités, promovidos, cobertura)
- GET /dashboard/exports/committees.xlsx — exportación a Excel de comités e integrantes
- GET /dashboard/committees/{id}/acta.pdf — acta en PDF con folio hash y listado de integrantes

Autenticación: Enviar encabezado `Authorization: Bearer <token>` retornado por /auth/google.

## Notas
- Máximo 10 integrantes por comité (configurable). 
- Solo se aceptan imágenes en la carga de documentos.
- Para generar los reportes se utilizan `openpyxl` (Excel) y `fpdf2` (PDF); asegúrate de instalar dependencias con `pip install -r requirements.txt`.
