"""
Script para agregar la columna phone a la tabla user
"""
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from sqlalchemy import text
from app.database import engine


def add_phone_column():
    """Agrega la columna phone a la tabla user"""
    
    query = """
    ALTER TABLE user 
    ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT NULL
    """
    
    with engine.connect() as conn:
        try:
            conn.execute(text(query))
            conn.commit()
            print(f"✓ Columna 'phone' agregada a la tabla 'user'")
        except Exception as e:
            if "Duplicate column" in str(e):
                print(f"○ Columna 'phone' ya existe, omitiendo...")
            else:
                print(f"❌ Error: {e}")
                raise


if __name__ == "__main__":
    print("Agregando columna phone a tabla user...\n")
    try:
        add_phone_column()
        print("\n✅ Migración completada exitosamente")
    except Exception as e:
        print(f"\n❌ Error durante la migración: {e}")
        sys.exit(1)
