from fastapi import FastAPI
from database import Base, engine
from routers import users
from routers import work_sessions

app = FastAPI()

# Inclure le routeur users
app.include_router(users.router)
app.include_router(work_sessions.router)


@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


