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
