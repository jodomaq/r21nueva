import os
import shutil
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from .. import models, schemas
from ..database import get_session
from ..dependencies import get_current_user
from ..config import settings

router = APIRouter(prefix="/committees", tags=["committees"])


@router.post("", response_model=schemas.CommitteeOut)
def create_committee(
    data: schemas.CommitteeCreate,
    session: Session = Depends(get_session),
    user: models.User = Depends(get_current_user),
):
    if len(data.members) > settings.max_members_per_committee:
        raise HTTPException(status_code=400, detail=f"Máximo {settings.max_members_per_committee} integrantes")

    # Validate committee type against DB
    ctype = session.exec(
        select(models.CommitteeType).where(
            models.CommitteeType.name == data.type,
            models.CommitteeType.is_active == True,  # noqa: E712
        )
    ).first()
    if not ctype:
        raise HTTPException(status_code=400, detail="Tipo de comité inválido o inactivo")

    committee = models.Committee(
        name=data.name,
        section_number=data.section_number,
        type=data.type,
        owner_id=user.id,
    )
    session.add(committee)
    session.flush()  # get committee id

    members = [
        models.CommitteeMember(
            full_name=m.full_name,
            ine_key=m.ine_key,
            phone=m.phone,
            email=m.email,
            section_number=m.section_number,
            invited_by=m.invited_by,
            committee_id=committee.id,
        )
        for m in data.members
    ]
    for m in members:
        session.add(m)
    session.commit()
    session.refresh(committee)
    return committee


@router.get("", response_model=List[schemas.CommitteeOut])
def list_committees(
    session: Session = Depends(get_session), user: models.User = Depends(get_current_user)
):
    committees = session.exec(
        select(models.Committee).where(models.Committee.owner_id == user.id).order_by(models.Committee.created_at.desc())
    ).all()
    return committees


@router.get("/{committee_id}", response_model=schemas.CommitteeOut)
def get_committee(committee_id: int, session: Session = Depends(get_session), user: models.User = Depends(get_current_user)):
    committee = session.get(models.Committee, committee_id)
    if not committee or committee.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Comité no encontrado")
    return committee


@router.post("/{committee_id}/members", response_model=schemas.CommitteeOut)
def add_member(
    committee_id: int,
    member: schemas.CommitteeMemberCreate,
    session: Session = Depends(get_session),
    user: models.User = Depends(get_current_user),
):
    committee = session.get(models.Committee, committee_id)
    if not committee or committee.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Comité no encontrado")
    session.refresh(committee)
    current_count = len(committee.members)
    if current_count >= settings.max_members_per_committee:
        raise HTTPException(status_code=400, detail="Ya tiene el máximo de integrantes")
    new_member = models.CommitteeMember(
        full_name=member.full_name,
        ine_key=member.ine_key,
        phone=member.phone,
        email=member.email,
        section_number=member.section_number,
        invited_by=member.invited_by,
        committee_id=committee.id,
    )
    session.add(new_member)
    session.commit()
    session.refresh(committee)
    return committee


@router.delete("/{committee_id}/members/{member_id}", response_model=schemas.CommitteeOut)
def delete_member(
    committee_id: int,
    member_id: int,
    session: Session = Depends(get_session),
    user: models.User = Depends(get_current_user),
):
    committee = session.get(models.Committee, committee_id)
    if not committee or committee.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Comité no encontrado")
    member = session.get(models.CommitteeMember, member_id)
    if not member or member.committee_id != committee.id:
        raise HTTPException(status_code=404, detail="Integrante no encontrado")
    session.delete(member)
    session.commit()
    session.refresh(committee)
    return committee


@router.delete("/{committee_id}", status_code=204)
def delete_committee(
    committee_id: int,
    session: Session = Depends(get_session),
    user: models.User = Depends(get_current_user),
):
    committee = session.get(models.Committee, committee_id)
    if not committee or committee.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Comité no encontrado")

    # Delete documents from disk and DB
    docs = session.exec(
        select(models.CommitteeDocument).where(models.CommitteeDocument.committee_id == committee_id)
    ).all()
    for d in docs:
        try:
            file_path = os.path.join(settings.upload_dir, d.filename)
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception:
            # Ignore file deletion errors but proceed with DB cleanup
            pass
        session.delete(d)

    # Delete members
    members = session.exec(
        select(models.CommitteeMember).where(models.CommitteeMember.committee_id == committee_id)
    ).all()
    for m in members:
        session.delete(m)

    # Delete the committee folder if exists
    committee_dir = os.path.join(settings.upload_dir, "committees", str(committee_id))
    try:
        if os.path.isdir(committee_dir):
            shutil.rmtree(committee_dir, ignore_errors=True)
    except Exception:
        pass

    # Finally delete the committee
    session.delete(committee)
    session.commit()
    return None
