import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .config import settings
from .database import init_db
from .auth import router as auth_router
from .routers.committees import router as committees_router
from .routers.documents import router as documents_router
from .routers.committee_types import router as committee_types_router
from .routers.ocr import router as ocr_router
from .routers.attendance import router as attendance_router
from .routers.dashboard import router as dashboard_router
from .routers.admin import router as admin_router


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        root_path="/api")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.frontend_origin, "http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth_router)
    app.include_router(committees_router)
    app.include_router(documents_router)
    app.include_router(committee_types_router)
    app.include_router(ocr_router)
    app.include_router(attendance_router)
    app.include_router(dashboard_router)
    app.include_router(admin_router)

    # Static files for uploaded images
    os.makedirs(settings.upload_dir, exist_ok=True)
    if not any([isinstance(r, StaticFiles) for r in app.routes]):
        app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")

    @app.on_event("startup")
    def on_startup():  # pragma: no cover - side effects only
        init_db()
        # Seed default committee types if table is empty
        try:
            from .database import engine
            from sqlmodel import Session, select
            from . import models
            with Session(engine) as session:
                exists = session.exec(select(models.CommitteeType).limit(1)).first()
                if not exists:
                    defaults = [
                        "Maestros",
                        "Transportistas",
                        "Seccionales",
                        "Municipales",
                        "Deportistas",
                    ]
                    for name in defaults:
                        session.add(models.CommitteeType(name=name, is_active=True))
                    session.commit()
        except Exception:
            # Do not block app startup if seeding fails
            pass

    @app.get("/health")
    def health():
        return {"status": "ok"}

    return app


app = create_app()
