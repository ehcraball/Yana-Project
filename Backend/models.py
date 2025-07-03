import uuid
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID

import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base
from sqlalchemy import create_engine, Column, String

class User(Base):
    __tablename__ = 'users'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    work_sessions = relationship("WorkSession", back_populates="user")




class WorkSession(Base):
    __tablename__ = 'work_sessions'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    start_time = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)
    mode = Column(String, nullable=False)
    work_duration = Column(Integer, nullable=True)
    pause_duration = Column(Integer, nullable=True)
    note = Column(String, nullable=True)
    work_cycles = Column(Integer, nullable=True)

    user = relationship("User", back_populates="work_sessions")
