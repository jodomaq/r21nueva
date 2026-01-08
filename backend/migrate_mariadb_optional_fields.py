"""
Script de migración para MariaDB: hacer opcionales los campos ine_key y email en CommitteeMember
"""
import pymysql
import sys
from pathlib import Path

# Añadir el directorio app al path para importar config
sys.path.insert(0, str(Path(__file__).parent / 'app'))

from config import settings

def migrate():
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
        
        print("✓ Conexión establecida")
        
        # Verificar el estado actual de las columnas
        cursor.execute("""
            SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = %s 
            AND TABLE_NAME = 'committeemember' 
            AND COLUMN_NAME IN ('ine_key', 'email')
        """, (settings.db_name,))
        
        columns_info = {row[0]: {'nullable': row[1], 'type': row[2]} for row in cursor.fetchall()}
        
        if not columns_info:
            print("❌ Error: No se encontró la tabla committeemember")
            return
        
        print("\n📊 Estado actual de las columnas:")
        for col_name, info in columns_info.items():
            nullable_text = "✓ Ya es opcional" if info['nullable'] == 'YES' else "✗ Es obligatorio"
            print(f"   {col_name}: {info['type']} - {nullable_text}")
        
        # Determinar qué columnas necesitan modificarse
        columns_to_modify = []
        
        ine_key_info = columns_info.get('ine_key')
        email_info = columns_info.get('email')
        
        if ine_key_info and ine_key_info['nullable'] == 'NO':
            columns_to_modify.append('ine_key')
        
        if email_info and email_info['nullable'] == 'NO':
            columns_to_modify.append('email')
        
        if not columns_to_modify:
            print("\n✅ Las columnas ya son opcionales. No se requiere migración.")
            return
        
        print(f"\n🔄 Iniciando migración para {len(columns_to_modify)} columna(s)...")
        
        # Modificar las columnas para permitir NULL
        if 'ine_key' in columns_to_modify:
            print("   Modificando ine_key...")
            cursor.execute("""
                ALTER TABLE committeemember 
                MODIFY COLUMN ine_key VARCHAR(255) NULL
            """)
            print("   ✓ ine_key ahora es opcional")
        
        if 'email' in columns_to_modify:
            print("   Modificando email...")
            cursor.execute("""
                ALTER TABLE committeemember 
                MODIFY COLUMN email VARCHAR(255) NULL
            """)
            print("   ✓ email ahora es opcional")
        
        # Confirmar cambios
        conn.commit()
        
        print("\n✅ Migración completada exitosamente!")
        print("   Los campos ine_key y email ahora son opcionales en committeemember")
        
    except pymysql.Error as e:
        print(f"\n❌ Error de MariaDB: {e}")
        if 'conn' in locals():
            conn.rollback()
            print("La base de datos no ha sido modificada (rollback ejecutado)")
        sys.exit(1)
    
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")
        import traceback
        traceback.print_exc()
        if 'conn' in locals():
            conn.rollback()
            print("La base de datos no ha sido modificada (rollback ejecutado)")
        sys.exit(1)
    
    finally:
        if 'conn' in locals():
            conn.close()
            print("\n🔌 Conexión cerrada")

if __name__ == "__main__":
    print("=" * 70)
    print("MIGRACIÓN: Campos opcionales ine_key y email")
    print("=" * 70)
    migrate()
