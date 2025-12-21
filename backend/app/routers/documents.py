import os
import uuid
import logging
import logging.handlers
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from sqlmodel import Session, select
from typing import List
from .. import models, schemas
from ..database import get_session
from ..dependencies import get_current_user
from ..config import settings

router = APIRouter(prefix="/committees", tags=["documents"])
log_path = os.path.join(settings.upload_dir, "logs")
os.makedirs(log_path, exist_ok=True)
handler = logging.handlers.RotatingFileHandler(
    os.path.join(log_path, "documents.log"), maxBytes=5_000_000, backupCount=3, encoding="utf-8"
)
formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(name)s %(message)s")
handler.setFormatter(formatter)

logger = logging.getLogger("documents")
logger.setLevel(logging.INFO)
logger.addHandler(handler)


@router.post("/{committee_id}/documents", response_model=List[schemas.DocumentOut])
async def upload_documents(
    committee_id: int,
    request: Request,
    files: list[UploadFile] = File(...),
    session: Session = Depends(get_session),
    user: models.User = Depends(get_current_user),
):
    logger.info("Inicia la subida de archivos para el comité %s", committee_id)
    try:
        committee = session.get(models.Committee, committee_id)
        if not committee:
            raise HTTPException(status_code=404, detail="Comité no encontrado")
        saved_docs = []
        base_dir = os.path.join(settings.upload_dir, "committees", str(committee_id))
        os.makedirs(base_dir, exist_ok=True)
        logger.info(
            "Payload crudo: content-type=%s, params=%s",
            request.headers.get("content-type"),
            request.query_params,
        )
        logger.info("Archivos anunciados: %s", [f.filename for f in files])    
        for f in files:
            if not (f.content_type.startswith("image/") or f.content_type == "application/pdf"):
                raise HTTPException(status_code=400, detail="Solo se permiten imágenes y archivos PDF")
            
            file_ext = os.path.splitext(f.filename)[1].lower()
            if not file_ext:
                if f.content_type.startswith("image/"):
                    file_ext = ".jpg"
                elif f.content_type == "application/pdf":
                    file_ext = ".pdf"

            new_name = f"{uuid.uuid4().hex}{file_ext}"
            full_path = os.path.join(base_dir, new_name)
            content = await f.read()
            logger.info("Archivo %s recibido (%s bytes, %s)", f.filename, len(content), f.content_type)
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
    except Exception:
        logger.exception("upload_documents failed for committee %s", committee_id)
        session.rollback()
        raise
    for d in saved_docs:
        session.refresh(d)
    return saved_docs


@router.get("/{committee_id}/documents", response_model=List[schemas.DocumentOut])
def list_documents(
    committee_id: int,
    session: Session = Depends(get_session),
    user: models.User = Depends(get_current_user),
):
    logger.info("Inicia la lectura de archivos para el comité %s", committee_id)
    committee = session.get(models.Committee, committee_id)
    if not committee:
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
