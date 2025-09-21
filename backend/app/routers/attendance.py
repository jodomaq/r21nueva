from fastapi import APIRouter, HTTPException, Request, Depends
from sqlmodel import Session, select
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from decimal import Decimal
from typing import Optional

from ..database import get_session
from ..models import Attendance
from ..schemas import AttendanceCreate, AttendanceResponse
from ..config import settings

router = APIRouter(prefix="/oauth", tags=["attendance"])


def get_client_ip(request: Request) -> Optional[str]:
    """Extract client IP from request headers"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else None


@router.post("/attendance/", response_model=AttendanceResponse)
async def oauth_attendance(
    attendance_data: AttendanceCreate,
    request: Request,
    session: Session = Depends(get_session)
):
    """
    Register attendance via Google OAuth
    
    Body JSON expected:
    {
      "provider": "google",
      "credential": "<google_id_token>",
      "device_id": "<device_fingerprint_hash>",
      "location": {"lat": float, "lng": float, "accuracy": int},
      "timezone": "America/Mexico_City"
    }
    """
    
    # Validate provider (only Google is supported now)
    if attendance_data.provider != "google":
        raise HTTPException(status_code=400, detail="Only Google provider is supported")
    
    if not attendance_data.credential:
        raise HTTPException(status_code=400, detail="credential is required")
    
    if not attendance_data.device_id:
        raise HTTPException(status_code=400, detail="device_id is required")
    
    # Verify Google OAuth token
    try:
        if not settings.GOOGLE_CLIENT_ID:
            raise HTTPException(status_code=500, detail="GOOGLE_CLIENT_ID not configured")
        
        # Verify the Google ID token
        idinfo = google_id_token.verify_oauth2_token(
            attendance_data.credential, 
            google_requests.Request(), 
            settings.GOOGLE_CLIENT_ID
        )
        
        # Extract user information from token
        provider_user_id = idinfo.get('sub')
        email = idinfo.get('email')
        name = idinfo.get('name', '')
        
        if not email or not provider_user_id:
            raise HTTPException(status_code=400, detail="Invalid Google token")
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid Google token: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Token verification failed: {str(e)}")
    
    # Get request metadata
    user_agent = request.headers.get('User-Agent', '')
    ip = get_client_ip(request)
    
    # Process location data
    latitude = None
    longitude = None
    accuracy = None
    
    if attendance_data.location:
        if attendance_data.location.lat is not None:
            latitude = Decimal(str(attendance_data.location.lat))
        if attendance_data.location.lng is not None:
            longitude = Decimal(str(attendance_data.location.lng))
        accuracy = attendance_data.location.accuracy
    
    try:
        # Create attendance record
        attendance = Attendance(
            provider=attendance_data.provider,
            provider_user_id=provider_user_id,
            email=email,
            name=name,
            device_id=attendance_data.device_id,
            user_agent=user_agent,
            ip=ip,
            latitude=latitude,
            longitude=longitude,
            accuracy=accuracy,
            timezone=attendance_data.timezone,
        )
        
        session.add(attendance)
        session.commit()
        session.refresh(attendance)
        
        return AttendanceResponse(ok=True, id=attendance.id)
        
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to create attendance record: {str(e)}")


@router.get("/attendance/", response_model=list[AttendanceResponse])
async def get_attendance_records(
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session)
):
    """Get attendance records (for admin purposes)"""
    statement = select(Attendance).offset(skip).limit(limit).order_by(Attendance.created_at.desc())
    attendances = session.exec(statement).all()
    
    return [
        AttendanceResponse(ok=True, id=attendance.id)
        for attendance in attendances
    ]