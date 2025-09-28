import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel import Session, select
from typing import List
from .. import models, schemas
from ..database import get_session
from ..dependencies import get_current_user
from ..config import settings

router = APIRouter(prefix="/committees", tags=["documents"])


@router.post("/{committee_id}/documents", response_model=List[schemas.DocumentOut])
async def upload_documents(
    committee_id: int,
    files: list[UploadFile] = File(...),
    session: Session = Depends(get_session),
    user: models.User = Depends(get_current_user),
):
    committee = session.get(models.Committee, committee_id)
    if not committee or committee.owner_id != user.email:
        raise HTTPException(status_code=404, detail="Comité no encontrado")

    saved_docs = []
    base_dir = os.path.join(settings.upload_dir, "committees", str(committee_id))
    os.makedirs(base_dir, exist_ok=True)
    for f in files:
        if not f.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Solo se permiten imágenes")
        file_ext = os.path.splitext(f.filename)[1] or ".jpg"
        new_name = f"{uuid.uuid4().hex}{file_ext}"
        full_path = os.path.join(base_dir, new_name)
        content = await f.read()
        with open(full_path, "wb") as out:
            out.write(content)
        doc = models.CommitteeDocument(
            filename=os.path.relpath(full_path, settings.upload_dir),
            original_name=f.filename,
            content_type=f.content_type,
            size=len(content),
            committee_id=committee.id,
        )
        session.add(doc)
        saved_docs.append(doc)
    session.commit()
    for d in saved_docs:
        session.refresh(d)
    return saved_docs


@router.get("/{committee_id}/documents", response_model=List[schemas.DocumentOut])
def list_documents(
    committee_id: int,
    session: Session = Depends(get_session),
    user: models.User = Depends(get_current_user),
):
    committee = session.get(models.Committee, committee_id)
    if not committee or committee.owner_id != user.email:
        raise HTTPException(status_code=404, detail="Comité no encontrado")
    docs = session.exec(
        select(models.CommitteeDocument).where(models.CommitteeDocument.committee_id == committee_id)
    ).all()
    return docs


@router.delete("/{committee_id}/documents/{document_id}", status_code=204)
def delete_document(
    committee_id: int,
    document_id: int,
    session: Session = Depends(get_session),
    user: models.User = Depends(get_current_user),
):
    committee = session.get(models.Committee, committee_id)
    if not committee or committee.owner_id != user.email:
        raise HTTPException(status_code=404, detail="Comité no encontrado")
    doc = session.get(models.CommitteeDocument, document_id)
    if not doc or doc.committee_id != committee_id:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    # Delete file from disk
    try:
        file_path = os.path.join(settings.upload_dir, doc.filename)
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception:
        # ignore file deletion errors
        pass
    session.delete(doc)
    session.commit()
    return None
