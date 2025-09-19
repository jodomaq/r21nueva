import base64
import re
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from ..dependencies import get_current_user
from .. import models, schemas
from ..config import settings
import requests

router = APIRouter(prefix="/ocr", tags=["ocr"])


def _extract_fields_from_text(text: str) -> dict:
    # Very simple heuristics; adjust per real INE layout.
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    joined = " \n ".join(lines)
    email = None
    m = re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", joined)
    if m:
        email = m.group(0)

    phone = None
    m = re.search(r"\b(?:\+?52\s*)?\d{10}\b", joined)
    if m:
        phone = m.group(0)

    ine_key = None
    # INE key formats vary; often 13-18 alphanumeric. Try a broad pattern.
    m = re.search(r"\b[0-9A-Z]{13,18}\b", joined)
    if m:
        ine_key = m.group(0)

    section_number = None
    m = re.search(r"SECCI[ÓO]N\s*(\d{1,4})", joined, flags=re.IGNORECASE)
    if m:
        section_number = m.group(1)
    else:
        m = re.search(r"\b(\d{1,4})\b", joined)
        if m:
            section_number = m.group(1)

    # Try to guess name: pick the longest uppercase-ish line not matching others
    name_candidates = [l for l in lines if len(l.split()) >= 2 and l.upper() == l]
    full_name = max(name_candidates, key=len) if name_candidates else None

    return {
        "full_name": full_name,
        "ine_key": ine_key,
        "phone": phone,
        "email": email,
        "section_number": section_number,
    }


@router.post("/ine", response_model=schemas.OcrIneOut)
async def ocr_ine(
    file: UploadFile = File(...),
    user: models.User = Depends(get_current_user),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Solo se permiten imágenes")
    content = await file.read()

    if not settings.openai_api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY no configurada")

    b64 = base64.b64encode(content).decode("utf-8")

    # Construct a prompt to extract fields
    prompt = (
        "Extrae del documento de identidad (INE de México) estos campos en texto plano, sin etiquetas ni adornos.\n"
        "- Nombre completo\n- Clave de elector (INE)\n- Teléfono (si aparece)\n- Email (si aparece)\n- Sección\n"
        "Responde primero con un bloque JSON con llaves: full_name, ine_key, phone, email, section_number.\n"
        "Si no encuentras un campo, deja null. Solo JSON."
    )

    try:
        resp = requests.post(
            f"{settings.openai_base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.openai_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": settings.openai_vision_model,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:{file.content_type};base64,{b64}",
                                },
                            },
                        ],
                    }
                ],
                "temperature": 0,
            },
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
        text = data["choices"][0]["message"]["content"]
    except Exception as e:
        # Fallback to simple heuristic OCR if API fails
        raise HTTPException(status_code=502, detail=f"Error al llamar OpenAI: {e}")

    # Try to parse JSON first
    parsed: dict | None = None
    if text:
        # Attempt to find JSON block
        m = re.search(r"\{[\s\S]*\}", text)
        if m:
            import json

            try:
                parsed = json.loads(m.group(0))
            except Exception:
                parsed = None

    if not parsed:
        # As a last resort, try simple extraction from raw text
        fields = _extract_fields_from_text(text or "")
    else:
        fields = {
            "full_name": parsed.get("full_name"),
            "ine_key": parsed.get("ine_key"),
            "phone": parsed.get("phone"),
            "email": parsed.get("email"),
            "section_number": parsed.get("section_number"),
        }

    return schemas.OcrIneOut(**fields)
