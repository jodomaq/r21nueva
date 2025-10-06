from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt
from sqlmodel import Session, select
from .config import settings
from .database import get_session
from . import models

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    session: Session = Depends(get_session),
) -> models.User:
    if credentials is None:
        raise HTTPException(status_code=401, detail="No autenticado")
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        user_id = int(payload.get("sub"))
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido")

    user = session.exec(select(models.User).where(models.User.id == user_id)).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    return user


def require_dashboard_user(
    user: models.User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> models.User:
    assignment = session.exec(
        select(models.UserAssignment)
        .where(models.UserAssignment.user_id == user.id)
        .order_by(models.UserAssignment.created_at.desc())
    ).first()
    if assignment is None or assignment.role is None or assignment.role > 5:
        raise HTTPException(status_code=403, detail="No cuentas con permisos para acceder al dashboard")
    return user
