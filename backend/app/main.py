import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .config import settings
from .database import init_db
from .auth import router as auth_router
from .routers.committees import router as committees_router
from .routers.documents import router as documents_router


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name)

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

    # Static files for uploaded images
    os.makedirs(settings.upload_dir, exist_ok=True)
    if not any([isinstance(r, StaticFiles) for r in app.routes]):
        app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")

    @app.on_event("startup")
    def on_startup():  # pragma: no cover - side effects only
        init_db()

    @app.get("/health")
    def health():
        return {"status": "ok"}

    return app


app = create_app()
