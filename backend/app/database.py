from sqlalchemy import text
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

    # Manual migrations for legacy databases (MySQL)
    if engine.dialect.name == "mysql":
        with engine.connect() as conn:
            result = conn.execute(text("SHOW COLUMNS FROM committee LIKE :column"), {"column": "administrative_unit_id"})
            if result.first() is None:
                logging.info("Adding column committee.administrative_unit_id (legacy migration)")
                conn.execute(text("ALTER TABLE committee ADD COLUMN administrative_unit_id INT NULL"))
                conn.commit()

            owner_result = conn.execute(text("SHOW COLUMNS FROM committee LIKE :column"), {"column": "owner_id"})
            owner_column = owner_result.mappings().first()
            if owner_column and not owner_column["Type"].lower().startswith("varchar"):
                logging.info("Altering column committee.owner_id to VARCHAR(255) (legacy migration)")
                conn.execute(text("ALTER TABLE committee MODIFY COLUMN owner_id VARCHAR(255) NOT NULL"))
                conn.commit()

            for column_name, column_type in [
                ("presidente", "VARCHAR(255)"),
                ("email", "VARCHAR(255)"),
                ("clave_afiliacion", "VARCHAR(255)"),
                ("telefono", "VARCHAR(64)"),
            ]:
                column_result = conn.execute(text("SHOW COLUMNS FROM committee LIKE :column"), {"column": column_name})
                column_info = column_result.mappings().first()

                if column_info is None:
                    logging.info("Adding column committee.%s (legacy migration)", column_name)
                    conn.execute(
                        text(
                            f"ALTER TABLE committee ADD COLUMN {column_name} {column_type} NOT NULL DEFAULT ''"
                        )
                    )
                    conn.commit()
                else:
                    logging.debug("Backfilling NULL values in committee.%s", column_name)
                    conn.execute(text(f"UPDATE committee SET {column_name} = '' WHERE {column_name} IS NULL"))
                    conn.commit()

                    needs_alter = column_info.get("Null", "YES") == "YES" or (column_info.get("Default") not in ("", "''"))
                    if needs_alter:
                        logging.info("Normalizing column committee.%s to NOT NULL DEFAULT ''", column_name)
                        conn.execute(
                            text(
                                f"ALTER TABLE committee MODIFY COLUMN {column_name} {column_type} NOT NULL DEFAULT ''"
                            )
                        )
                        conn.commit()


def get_session():
    with Session(engine) as session:
        yield session
