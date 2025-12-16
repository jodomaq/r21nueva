from datetime import datetime, timezone, timedelta
from typing import Optional, List
from decimal import Decimal
from sqlmodel import SQLModel, Field, Relationship

# Zona horaria de Ciudad de México (UTC-6)
MEXICO_CITY_TZ = timezone(timedelta(hours=-6))

def get_mexico_city_time():
    """Retorna la hora actual en zona horaria de Ciudad de México (UTC-6)"""
    return datetime.now(MEXICO_CITY_TZ)


# ...existing code...
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    name: str
    phone: Optional[str] = Field(default=None, max_length=20, description="Número de teléfono celular")
    picture_url: Optional[str] = None
    created_at: datetime = Field(default_factory=get_mexico_city_time)

    committees: List["Committee"] = Relationship(back_populates="owner")
    # NUEVO: asignaciones jerárquicas
    assignments: List["UserAssignment"] = Relationship(back_populates="user")
# ...existing code...


# NUEVO
class AdministrativeUnit(SQLModel, table=True):
    """
    Unidad territorial jerárquica:
    STATE -> REGION -> DISTRICT -> MUNICIPALITY -> SECTION
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    code: Optional[str] = Field(default=None, index=True, description="Clave o número oficial (ej: sección)")
    unit_type: str = Field(index=True)  # 'STATE','REGION','DISTRICT','MUNICIPALITY','SECTION'
    parent_id: Optional[int] = Field(default=None, foreign_key="administrativeunit.id", index=True)
    created_at: datetime = Field(default_factory=get_mexico_city_time, index=True)
    
    # Referencia a la tabla Seccion para sincronización
    seccion_municipio_id: Optional[int] = Field(default=None, index=True, description="ID del municipio en tabla Seccion")
    seccion_distrito_id: Optional[int] = Field(default=None, index=True, description="ID del distrito en tabla Seccion")

    parent: Optional["AdministrativeUnit"] = Relationship(back_populates="children", sa_relationship_kwargs={"remote_side": "AdministrativeUnit.id"})
    children: List["AdministrativeUnit"] = Relationship(back_populates="parent")

    # Usuarios asignados (coordinadores, delegado, etc.)
    user_assignments: List["UserAssignment"] = Relationship(back_populates="administrative_unit")

    # Comités ligados a esta unidad (especiales en DISTRICT, seccionales en SECTION)
    committees: List["Committee"] = Relationship(back_populates="administrative_unit")


# NUEVO
class UserAssignment(SQLModel, table=True):
    """
    Asigna un usuario a una unidad con un rol jerárquico.
    Rol esperado:
      - COORDINADOR_ESTATAL (en STATE)
      - DELEGADO_REGIONAL (en REGION)
      - COORDINADOR_DISTRITAL (en DISTRICT)
      - COORDINADOR_MUNICIPAL (en MUNICIPALITY)
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    administrative_unit_id: int = Field(foreign_key="administrativeunit.id", index=True)
    role: int = Field(index=True) # 1=COORDINADOR_ESTATAL, 2=DELEGADO_REGIONAL, 3=COORDINADOR_DISTRITAL, 4=COORDINADOR_MUNICIPAL, 5=COORDINADOR_SECCIONAL, 6=PRESIDENTE_COMITE
    created_at: datetime = Field(default_factory=get_mexico_city_time, index=True)

    user: Optional[User] = Relationship(back_populates="assignments")
    administrative_unit: Optional[AdministrativeUnit] = Relationship(back_populates="user_assignments")


# ...existing code...
class Committee(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    section_number: str = Field(index=True)  # DEPRECATED: usar administrative_unit_id (SECTION) para seccionales
    # Store the human-readable type name for now; validated against CommitteeType table
    type: str = Field(index=True, description="Committee type name, validated against CommitteeType table")  # 'seccional' | 'especial'
    owner_id: str = Field(foreign_key="user.email", index=True)
    created_at: datetime = Field(default_factory=get_mexico_city_time, index=True)
    presidente: str = Field(default="", description="Nombre del presidente del comité")
    email: str = Field(default="", description="Correo electrónico del presidente del comité")
    clave_afiliacion: str = Field(default="", description="Clave de afiliación del presidente del comité")
    telefono: str = Field(default="", description="Teléfono del presidente del comité")

    # NUEVO: unidad territorial. Para comités especiales apuntará al DISTRICT.
    administrative_unit_id: Optional[int] = Field(default=None, foreign_key="administrativeunit.id", index=True)

    owner: Optional[User] = Relationship(back_populates="committees")
    members: List["CommitteeMember"] = Relationship(back_populates="committee")
    documents: List["CommitteeDocument"] = Relationship(back_populates="committee")
    administrative_unit: Optional[AdministrativeUnit] = Relationship(back_populates="committees")
# ...existing code...


class CommitteeMember(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    full_name: str
    ine_key: str = Field(index=True)
    phone: str
    email: str
    section_number: str
    invited_by: str
    committee_id: int = Field(foreign_key="committee.id", index=True)
    created_at: datetime = Field(default_factory=get_mexico_city_time)

    committee: Optional[Committee] = Relationship(back_populates="members")


class CommitteeDocument(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    filename: str
    original_name: str
    content_type: str
    size: int
    committee_id: int = Field(foreign_key="committee.id", index=True)
    created_at: datetime = Field(default_factory=get_mexico_city_time)

    committee: Optional[Committee] = Relationship(back_populates="documents")


class CommitteeType(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True, description="Display name for the committee type")
    is_active: bool = Field(default=True, index=True)
    created_at: datetime = Field(default_factory=get_mexico_city_time, index=True)


class Attendance(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    provider: str = Field(max_length=20, default="google")  # Only google now
    provider_user_id: str = Field(max_length=128, index=True)
    email: str = Field(index=True)
    name: str = Field(max_length=255, default="")
    device_id: str = Field(max_length=128, index=True)
    user_agent: str = Field(default="")
    ip: Optional[str] = Field(default=None)
    latitude: Optional[Decimal] = Field(default=None, max_digits=9, decimal_places=6)
    longitude: Optional[Decimal] = Field(default=None, max_digits=9, decimal_places=6)
    accuracy: Optional[int] = Field(default=None)
    timezone: str = Field(max_length=64, default="")
    created_at: datetime = Field(default_factory=get_mexico_city_time, index=True)

class Seccion(SQLModel, table=True):
    """
    Mapeo de la tabla MySQL `seccion`.
    Nota: La tabla original no declara PRIMARY KEY; aquí usamos `id` como PK para compatibilidad con SQLModel.
    """
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    municipio: Optional[int] = Field(default=None, index=True)
    nombre_municipio: Optional[str] = Field(default=None, max_length=50)
    distrito: Optional[int] = Field(default=None, index=True)
    nombre_distrito: Optional[str] = Field(default=None, max_length=50)
    distrito_federal: Optional[int] = Field(default=None, index=True)

