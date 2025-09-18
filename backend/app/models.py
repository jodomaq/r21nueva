from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    name: str
    picture_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    committees: List["Committee"] = Relationship(back_populates="owner")


class Committee(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    section_number: str = Field(index=True)
    type: str = Field(index=True, description="Maestros|Transportistas|Seccionales|Municipales|Deportistas")
    owner_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    owner: Optional[User] = Relationship(back_populates="committees")
    members: List["CommitteeMember"] = Relationship(back_populates="committee")
    documents: List["CommitteeDocument"] = Relationship(back_populates="committee")


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
