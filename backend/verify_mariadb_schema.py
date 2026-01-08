"""
Script para verificar el estado de las columnas en committeemember
"""
import pymysql
import sys
from pathlib import Path

# Añadir el directorio app al path para importar config
sys.path.insert(0, str(Path(__file__).parent / 'app'))

from config import settings

def verify():
    print(f"Conectando a MariaDB: {settings.db_host}:{settings.db_port}/{settings.db_name}")
    
    try:
        conn = pymysql.connect(
            user=settings.db_user,
            password=settings.db_password,
            host=settings.db_host,
            port=settings.db_port,
            database=settings.db_name,
            charset='utf8mb4'
        )
        cursor = conn.cursor()
        
        print("✓ Conexión establecida\n")
        
        # Obtener información de todas las columnas de committeemember
        cursor.execute("""
            SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = %s 
            AND TABLE_NAME = 'committeemember'
            ORDER BY ORDINAL_POSITION
        """, (settings.db_name,))
        
        columns = cursor.fetchall()
        
        if not columns:
            print("❌ No se encontró la tabla committeemember")
            return
        
        print("=" * 80)
        print("ESTRUCTURA DE LA TABLA committeemember")
        print("=" * 80)
        print(f"{'Campo':<20} {'Tipo':<20} {'NULL':<8} {'Default':<15} {'Key':<8}")
        print("-" * 80)
        
        for col in columns:
            nombre = col[0]
            tipo = col[1]
            nullable = col[2]
            default = str(col[3]) if col[3] is not None else '-'
            key = col[4] if col[4] else '-'
            
            print(f"{nombre:<20} {tipo:<20} {nullable:<8} {default:<15} {key:<8}")
        
        print("=" * 80)
        
        # Resaltar el estado de ine_key y email
        cursor.execute("""
            SELECT COLUMN_NAME, IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = %s 
            AND TABLE_NAME = 'committeemember'
            AND COLUMN_NAME IN ('ine_key', 'email')
        """, (settings.db_name,))
        
        target_columns = {row[0]: row[1] for row in cursor.fetchall()}
        
        print("\n📊 Estados de los campos objetivo:")
        for col_name in ['ine_key', 'email']:
            if col_name in target_columns:
                is_nullable = target_columns[col_name]
                status = "✅ OPCIONAL" if is_nullable == 'YES' else "❌ OBLIGATORIO"
                print(f"   {col_name}: {status}")
        
    except pymysql.Error as e:
        print(f"\n❌ Error de MariaDB: {e}")
        sys.exit(1)
    
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    
    finally:
        if 'conn' in locals():
            conn.close()
            print("\n🔌 Conexión cerrada")

if __name__ == "__main__":
    verify()
