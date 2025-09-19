from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List

from ..database import get_session
from .. import models, schemas
from ..dependencies import get_current_user


router = APIRouter(prefix="/committee-types", tags=["committee-types"])


@router.get("", response_model=List[schemas.CommitteeTypeOut])
def list_committee_types(
    session: Session = Depends(get_session),
    user: models.User = Depends(get_current_user),
):
    # Optionally, restrict by owner in the future; for now return all active
    types = session.exec(select(models.CommitteeType).where(models.CommitteeType.is_active == True).order_by(models.CommitteeType.name)).all()  # noqa: E712
    return types


@router.post("", response_model=schemas.CommitteeTypeOut)
def create_committee_type(
    data: schemas.CommitteeTypeCreate,
    session: Session = Depends(get_session),
    user: models.User = Depends(get_current_user),
):
    existing = session.exec(select(models.CommitteeType).where(models.CommitteeType.name == data.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="El tipo ya existe")
    ct = models.CommitteeType(name=data.name, is_active=data.is_active)
    session.add(ct)
    session.commit()
    session.refresh(ct)
    return ct
