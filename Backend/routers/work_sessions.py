from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from database import get_session
from models import WorkSession, User
from schemas import WorkSessionCreate, WorkSessionRead
from routers.users import get_current_user

router = APIRouter(prefix="/work_sessions", tags=["work_sessions"])

@router.post("/", response_model=WorkSessionRead)
async def create_work_session(
    session_in: WorkSessionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    ws = WorkSession(
    user_id=current_user.id,
    start_time=session_in.start_time,
    end_time=session_in.end_time,
    mode=session_in.mode,
    work_duration=session_in.work_duration,
    pause_duration=session_in.pause_duration,
    work_cycles=session_in.work_cycles,  # ajouté
    note=session_in.note if session_in.note else None,
    )
    db.add(ws)
    await db.commit()
    await db.refresh(ws)
    return ws



@router.get("/", response_model=list[WorkSessionRead])
async def read_work_sessions(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    result = await db.execute(
        select(WorkSession).where(WorkSession.user_id == current_user.id).offset(skip).limit(limit)
    )
    return result.scalars().all()
