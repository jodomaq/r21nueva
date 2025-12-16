"""
Script para agregar las columnas de sincronización a AdministrativeUnit
"""
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from sqlalchemy import text
from app.database import engine


def add_sync_columns():
    """Agrega las columnas de sincronización a la tabla administrativeunit"""
    
    queries = [
        """
        ALTER TABLE administrativeunit 
        ADD COLUMN IF NOT EXISTS seccion_municipio_id INT DEFAULT NULL,
        ADD INDEX IF NOT EXISTS idx_seccion_municipio_id (seccion_municipio_id)
        """,
        """
        ALTER TABLE administrativeunit 
        ADD COLUMN IF NOT EXISTS seccion_distrito_id INT DEFAULT NULL,
        ADD INDEX IF NOT EXISTS idx_seccion_distrito_id (seccion_distrito_id)
        """
    ]
    
    with engine.connect() as conn:
        for query in queries:
            try:
                conn.execute(text(query))
                conn.commit()
                print(f"✓ Ejecutado: {query[:60]}...")
            except Exception as e:
                if "Duplicate column" in str(e):
                    print(f"○ Columna ya existe, omitiendo...")
                else:
                    print(f"❌ Error: {e}")
                    raise


if __name__ == "__main__":
    print("Agregando columnas de sincronización a AdministrativeUnit...\n")
    try:
        add_sync_columns()
        print("\n✅ Migración completada exitosamente")
    except Exception as e:
        print(f"\n❌ Error durante la migración: {e}")
        sys.exit(1)
