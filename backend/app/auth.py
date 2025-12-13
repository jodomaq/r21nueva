from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import msal
import requests
import jwt
from datetime import datetime, timedelta, timezone
from sqlmodel import Session, insert, select
from .config import settings
from .database import get_session
from .dependencies import get_current_user
from . import models, schemas

router = APIRouter(prefix="/auth", tags=["auth"])


class GoogleAuthIn(BaseModel):
    id_token: str


class MicrosoftAuthIn(BaseModel):
    access_token: str


def create_jwt(user: models.User) -> str:
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "exp": datetime.utcnow() + timedelta(hours=12),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


@router.post("/google", response_model=schemas.TokenResponse)
def google_login(data: GoogleAuthIn, session: Session = Depends(get_session)):
    try:
        print("Settings google client id:", settings.google_client_id)
        idinfo = id_token.verify_oauth2_token(data.id_token, google_requests.Request(), settings.google_client_id)
    except Exception as e:  # broad, but we convert to 401
        print(f"Error verificando token de Google: {e}")
        raise HTTPException(status_code=401, detail=f"Token de Google inválido: {e}")

    email = idinfo.get("email")
    #if not email or not email.endswith("@gmail.com"):
    #    raise HTTPException(status_code=400, detail="Debe iniciar sesión con una cuenta que termine con gmail")

    registrado = session.exec(select(models.Committee).where(models.Committee.email == email)).first()
    if not registrado:
        raise HTTPException(status_code=403, detail="Usuario no registrado. Contacta a tu coordinador.")

    name = idinfo.get("name") or email.split("@")[0]
    picture = idinfo.get("picture")

    user = session.exec(select(models.User).where(models.User.email == email)).first()
    if not user:
        user = models.User(email=email, name=name, picture_url=picture)
        session.add(user)
        session.commit()
        session.refresh(user)

    user_assignment = session.exec(
        select(models.UserAssignment).where(
            models.UserAssignment.user_id == user.id,
            models.UserAssignment.administrative_unit_id == 1,
        )
    ).first()
    if not user_assignment:
        user_assignment = models.UserAssignment(
            user_id=user.id,
            administrative_unit_id=1,
            role=6,  # 6=PRESIDENTE_COMITE
        )
        session.add(user_assignment)
        session.commit()
        session.refresh(user_assignment)
    else:
        session.refresh(user_assignment)

    token = create_jwt(user)
    return schemas.TokenResponse(access_token=token, user=user)  # type: ignore[arg-type]


@router.post("/microsoft", response_model=schemas.TokenResponse)
def microsoft_login(data: MicrosoftAuthIn, session: Session = Depends(get_session)):
    """
    Endpoint para autenticación con Microsoft (Hotmail/Outlook).
    El frontend debe enviar el access_token obtenido del flujo OAuth de Microsoft.
    """
    try:
        # Verificar el token con Microsoft Graph API
        headers = {"Authorization": f"Bearer {data.access_token}"}
        response = requests.get("https://graph.microsoft.com/v1.0/me", headers=headers)
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=401, 
                detail=f"Token de Microsoft inválido: {response.text}"
            )
        
        user_info = response.json()
        email = user_info.get("mail") or user_info.get("userPrincipalName")
        
        if not email:
            raise HTTPException(status_code=400, detail="No se pudo obtener el email del usuario")
        
        # Verificar si el usuario está registrado en un comité
        registrado = session.exec(select(models.Committee).where(models.Committee.email == email)).first()
        if not registrado:
            raise HTTPException(status_code=403, detail="Usuario no registrado. Contacta a tu coordinador.")
        
        # Obtener nombre y crear/actualizar usuario
        name = user_info.get("displayName") or email.split("@")[0]
        
        user = session.exec(select(models.User).where(models.User.email == email)).first()
        if not user:
            user = models.User(email=email, name=name, picture_url=None)
            session.add(user)
            session.commit()
            session.refresh(user)
        
        # Crear o verificar asignación de usuario
        user_assignment = session.exec(
            select(models.UserAssignment).where(
                models.UserAssignment.user_id == user.id,
                models.UserAssignment.administrative_unit_id == 1,
            )
        ).first()
        
        if not user_assignment:
            user_assignment = models.UserAssignment(
                user_id=user.id,
                administrative_unit_id=1,
                role=6,  # 6=PRESIDENTE_COMITE
            )
            session.add(user_assignment)
            session.commit()
            session.refresh(user_assignment)
        else:
            session.refresh(user_assignment)
        
        token = create_jwt(user)
        return schemas.TokenResponse(access_token=token, user=user)  # type: ignore[arg-type]
        
    except requests.RequestException as e:
        print(f"Error verificando token de Microsoft: {e}")
        raise HTTPException(status_code=401, detail=f"Error al verificar token de Microsoft: {e}")
    except Exception as e:
        print(f"Error en autenticación Microsoft: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {e}")


@router.get("/me", response_model=schemas.UserOut)
def get_me(user: models.User = Depends(get_current_user)):
    return user


@router.get("/me/assignment", response_model=schemas.AssignmentOut)
def get_my_assignment(
    session: Session = Depends(get_session),
    user: models.User = Depends(get_current_user),
):
    # Fetch latest role assignment for this user if exists
    role = None
    try:
        ua = session.exec(
            select(models.UserAssignment)
            .where(models.UserAssignment.user_id == user.id)
            .order_by(models.UserAssignment.created_at.desc())
        ).first()
        if ua:
            role = ua.role
    except Exception:
        role = None

    committees = session.exec(
        select(models.Committee).where(models.Committee.email == user.email)
    ).all() or []
    return schemas.AssignmentOut(role=role, committees_owned=committees)  # type: ignore[arg-type]
