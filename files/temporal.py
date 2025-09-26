
from datetime import datetime
from typing import Optional, List
from decimal import Decimal
from sqlmodel import SQLModel, Field, Relationship


# ...existing code...
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    name: str
    picture_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

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
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

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
    role: str = Field(index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    user: Optional[User] = Relationship(back_populates="assignments")
    administrative_unit: Optional[AdministrativeUnit] = Relationship(back_populates="user_assignments")


# ...existing code...
class Committee(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    section_number: str = Field(index=True)  # DEPRECATED: usar administrative_unit_id (SECTION) para seccionales
    # Store the human-readable type name for now; validated against CommitteeType table
    type: str = Field(index=True, description="Committee type name, validated against CommitteeType table")  # 'seccional' | 'especial'
    owner_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

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
    created_at: datetime = Field(default_factory=datetime.utcnow)

    committee: Optional[Committee] = Relationship(back_populates="members")


class CommitteeDocument(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    filename: str
    original_name: str
    content_type: str
    size: int
    committee_id: int = Field(foreign_key="committee.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    committee: Optional[Committee] = Relationship(back_populates="documents")


class CommitteeType(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True, description="Display name for the committee type")
    is_active: bool = Field(default=True, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)


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
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)