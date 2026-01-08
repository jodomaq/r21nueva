from typing import List, Optional
from pydantic import BaseModel, EmailStr, field_validator
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
    ine_key: Optional[str] = None
    phone: str
    email: Optional[str] = None
    section_number: str
    invited_by: str
    
    @field_validator('ine_key', mode='before')
    @classmethod
    def validate_ine_key(cls, v):
        """Convertir cadena vacía a None"""
        if v == "" or (isinstance(v, str) and v.strip() == ""):
            return None
        return v
    
    @field_validator('email', mode='before')
    @classmethod
    def validate_email(cls, v):
        """Convertir cadena vacía a None"""
        if v == "" or (isinstance(v, str) and v.strip() == ""):
            return None
        return v


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
    has_document: bool = False

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


# Dashboard stats schemas
class CommitteeOwnerStat(BaseModel):
    owner_email: str
    owner_name: Optional[str] = None
    owner_id: Optional[int] = None
    total: int


class CommitteeLocationStat(BaseModel):
    code: Optional[str] = None
    label: str
    municipality: Optional[str] = None
    total: int


class CommitteeTypeStat(BaseModel):
    type: str
    total: int


class CommitteeStatsResponse(BaseModel):
    by_user: List[CommitteeOwnerStat]
    by_section: List[CommitteeLocationStat]
    by_municipality: List[CommitteeLocationStat]
    by_type: List[CommitteeTypeStat]


class AssignmentUserSummary(BaseModel):
    user_id: int
    user_name: str
    user_email: EmailStr
    role: int
    role_label: str


class AdministrativeUnitNode(BaseModel):
    id: int
    name: str
    code: Optional[str] = None
    unit_type: str
    assignments: List[AssignmentUserSummary] = []
    children: List["AdministrativeUnitNode"] = []
    total_committees: int = 0
    total_members: int = 0

    class Config:
        from_attributes = True


class UserAssignmentRow(BaseModel):
    assignment_id: int
    user_id: int
    user_name: str
    user_email: EmailStr
    role: int
    role_label: str
    administrative_unit_id: int
    administrative_unit_name: str
    administrative_unit_type: str
    created_at: datetime


class AdministrativeUnitRef(BaseModel):
    id: int
    name: str
    unit_type: str
    code: Optional[str] = None

    class Config:
        from_attributes = True


class SectionRef(BaseModel):
    id: Optional[int] = None
    municipio: Optional[int] = None
    nombre_municipio: Optional[str] = None
    distrito: Optional[int] = None
    nombre_distrito: Optional[str] = None
    distrito_federal: Optional[int] = None

    class Config:
        from_attributes = True


class DocumentWithUrl(DocumentOut):
    url: str


class CommitteeDashboardOut(BaseModel):
    id: int
    name: str
    section_number: str
    type: str
    owner_id: str
    owner_name: Optional[str] = None
    created_at: datetime
    presidente: str
    email: str
    clave_afiliacion: str
    telefono: str
    administrative_unit: Optional[AdministrativeUnitRef] = None
    section: Optional[SectionRef] = None
    members: List[CommitteeMemberOut] = []
    documents: List[DocumentWithUrl] = []
    total_members: int

    class Config:
        from_attributes = True


class DocumentGalleryItem(BaseModel):
    id: int
    committee_id: int
    committee_name: str
    url: str
    original_name: str
    content_type: str
    size: int
    created_at: datetime


class DashboardMetrics(BaseModel):
    total_committees: int
    total_promovidos: int
    municipios_cubiertos: int
    municipios_meta: int
    porcentaje_municipios: float
    secciones_cubiertas: int
    total_secciones: int
    porcentaje_secciones: float
    total_documentos: int


class AttendanceMapPoint(BaseModel):
    id: int
    name: str
    email: EmailStr
    latitude: Optional[Decimal]
    longitude: Optional[Decimal]
    created_at: datetime

    class Config:
        from_attributes = True


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


AdministrativeUnitNode.model_rebuild()
