from typing import List, Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime
from decimal import Decimal

class CommitteeTypeOut(BaseModel):
    id: int
    name: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class CommitteeTypeCreate(BaseModel):
    name: str
    is_active: bool = True


class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: str
    picture_url: Optional[str]

    class Config:
        from_attributes = True


class CommitteeMemberBase(BaseModel):
    full_name: str
    ine_key: str
    phone: str
    email: EmailStr
    section_number: str
    invited_by: str


class CommitteeMemberCreate(CommitteeMemberBase):
    pass


class CommitteeMemberOut(CommitteeMemberBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class CommitteeBase(BaseModel):
    name: str
    section_number: str
    type: str
    presidente: str
    email: str
    clave_afiliacion: str
    telefono: str


class CommitteeCreate(CommitteeBase):
    email: EmailStr
    members: List[CommitteeMemberCreate]


class CommitteeOut(CommitteeBase):
    id: int
    created_at: datetime
    owner_id: str
    members: List[CommitteeMemberOut] = []

    class Config:
        from_attributes = True


class DocumentOut(BaseModel):
    id: int
    filename: str
    original_name: str
    content_type: str
    size: int
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class OcrIneOut(BaseModel):
    full_name: str | None = None
    ine_key: str | None = None
    phone: str | None = None
    email: str | None = None
    section_number: str | None = None


# Attendance schemas
class LocationData(BaseModel):
    lat: Optional[float] = None
    lng: Optional[float] = None
    accuracy: Optional[int] = None


class AttendanceCreate(BaseModel):
    provider: str = "google"
    credential: str
    device_id: str
    location: Optional[LocationData] = None
    timezone: str = ""


class AttendanceOut(BaseModel):
    id: int
    provider: str
    provider_user_id: str
    email: str
    name: str
    device_id: str
    user_agent: str
    ip: Optional[str]
    latitude: Optional[Decimal]
    longitude: Optional[Decimal]
    accuracy: Optional[int]
    timezone: str
    created_at: datetime

    class Config:
        from_attributes = True


class AttendanceResponse(BaseModel):
    ok: bool
    id: Optional[int] = None
    error: Optional[str] = None


# Assignment/Access schemas
class SimpleCommitteeOut(BaseModel):
    id: int
    name: str
    presidente: str
    email: str
    clave_afiliacion: str
    telefono: str

    class Config:
        from_attributes = True


class AssignmentOut(BaseModel):
    role: Optional[int] = None
    committees_owned: List[SimpleCommitteeOut] = []
