import sys
import logging
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

# Asegura que "backend" esté en sys.path si se ejecuta directamente
CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.config import settings  # noqa: E402
from app.database import init_db  # noqa: E402


def _sanitize_db_url(url: str) -> str:
    try:
        parts = urlsplit(url)
        netloc = ""
        if parts.hostname:
            auth = parts.username or ""
            if parts.password:
                auth = f"{auth}:***"
            if auth:
                netloc = f"{auth}@{parts.hostname}"
            else:
                netloc = parts.hostname
            if parts.port:
                netloc = f"{netloc}:{parts.port}"
        return urlunsplit((parts.scheme, netloc, parts.path, parts.query, parts.fragment))
    except Exception:
        return url

def main():
    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    logging.info("Creando tablas si no existen...")
    logging.info("Base de datos: %s", _sanitize_db_url(settings.database_url))
    init_db()
    logging.info("Listo.")

if __name__ == "__main__":
    main()
