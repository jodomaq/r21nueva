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

Autenticación: Enviar encabezado `Authorization: Bearer <token>` retornado por /auth/google.

## Notas
- Máximo 10 integrantes por comité (configurable). 
- Solo se aceptan imágenes en la carga de documentos.
