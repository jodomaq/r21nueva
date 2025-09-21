from sqlmodel import create_engine, Session, SQLModel
from .config import settings


engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_recycle=300,
    connect_args={"check_same_thread": False} if str(settings.database_url).startswith("sqlite") else {},
)


def init_db():
    import logging
    from . import models  # noqa: F401 ensure models imported
    
    logging.info("Creating database tables (if not exist)...")
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
