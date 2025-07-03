from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserRead(BaseModel):
    id: UUID
    username: str
    email: EmailStr

    class Config:
        orm_mode = True

class WorkSessionBase(BaseModel):
    start_time: datetime
    end_time: datetime | None = None
    mode: str
    work_duration: int | None = None       # nouveau
    pause_duration: int | None = None      # nouveau
    work_cycles: int | None = None

    note: Optional[str] = None

class WorkSessionCreate(WorkSessionBase):
    pass

class WorkSessionRead(WorkSessionBase):
    id: UUID
    user_id: UUID

    class Config:
        orm_mode = True