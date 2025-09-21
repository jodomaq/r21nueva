from pydantic import BaseModel
import os
from dotenv import load_dotenv, find_dotenv
from pathlib import Path

# Carga robusta del .env:
# 1. Busca recursivamente hacia arriba (find_dotenv)
# 2. Si no encuentra, intenta uno local en la carpeta de este archivo (app/.env)
env_file = find_dotenv()
if not env_file:
    candidate = Path(__file__).parent / '.env'
    if candidate.exists():
        env_file = str(candidate)

if env_file:
    load_dotenv(env_file)
else:
    print("[config] Advertencia: No se encontró archivo .env. Variables dependerán del entorno del sistema.")

class Settings(BaseModel):
    app_name: str = "Comités MORENA"
    environment: str = os.getenv("ENV", "dev")
    # Cambia default a vacío para calcular desde DB_*
    database_url: str = os.getenv("DATABASE_URL", "")
    jwt_secret: str = os.getenv("JWT_SECRET", "change-me")
    jwt_algorithm: str = "HS256"
    google_client_id: str = os.getenv("GOOGLE_CLIENT_ID", "")
    frontend_origin: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    max_members_per_committee: int = 10
    upload_dir: str = os.getenv("UPLOAD_DIR", "uploads")
    # Nuevos campos para MariaDB
    db_user: str = os.getenv("DB_USER", "")
    db_password: str = os.getenv("DB_PASSWORD", "")
    db_host: str = os.getenv("DB_HOST", "localhost")
    db_port: int = int(os.getenv("DB_PORT", "3306"))
    db_name: str = os.getenv("DB_NAME", "r21db25")
    # OpenAI Vision
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    openai_vision_model: str = os.getenv("OPENAI_VISION_MODEL", "gpt-4o-mini")
    openai_base_url: str = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")

settings = Settings()

# Property for easier access to Google Client ID
settings.GOOGLE_CLIENT_ID = settings.google_client_id

# Si no hay DATABASE_URL, construye una para MariaDB
if not settings.database_url:
    settings.database_url = (
        f"mariadb+mariadbconnector://{settings.db_user}:{settings.db_password}"
        f"@{settings.db_host}:{settings.db_port}/{settings.db_name}"
    )

if not settings.google_client_id:
    print("[config] Advertencia: GOOGLE_CLIENT_ID vacío. Verifica ubicación del .env o exporta la variable.")
