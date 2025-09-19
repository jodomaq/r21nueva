from typing import List, Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

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


class CommitteeCreate(CommitteeBase):
    members: List[CommitteeMemberCreate]


class CommitteeOut(CommitteeBase):
    id: int
    created_at: datetime
    owner_id: int
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
