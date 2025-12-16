"""
Script para poblar AdministrativeUnit basándose en los datos de Seccion.
Crea la jerarquía: STATE -> DISTRICT -> MUNICIPALITY -> SECTION
"""
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from sqlmodel import Session, select, func
from app.database import engine
from app.models import AdministrativeUnit, Seccion


def populate_administrative_units():
    """
    Crea la jerarquía de AdministrativeUnit basándose en los datos de Seccion.
    Estructura: STATE -> DISTRICT -> MUNICIPALITY -> SECTION
    """
    with Session(engine) as session:
        print("="*60)
        print("POBLANDO UNIDADES ADMINISTRATIVAS DESDE SECCION")
        print("="*60)
        
        # 1. Crear el estado de Michoacán (raíz)
        state = session.exec(
            select(AdministrativeUnit).where(
                AdministrativeUnit.unit_type == "STATE",
                AdministrativeUnit.code == "16"
            )
        ).first()
        
        if not state:
            state = AdministrativeUnit(
                name="Michoacán",
                code="16",
                unit_type="STATE",
                parent_id=None
            )
            session.add(state)
            session.commit()
            session.refresh(state)
            print(f"\n✓ Creado: {state.name} (STATE) - ID: {state.id}")
        else:
            print(f"\n○ Ya existe: {state.name} (STATE) - ID: {state.id}")

        # 2. Obtener todos los distritos únicos de Seccion
        print("\n" + "-"*60)
        print("CREANDO DISTRITOS")
        print("-"*60)
        
        distritos_query = session.exec(
            select(
                Seccion.distrito,
                Seccion.nombre_distrito
            )
            .where(
                Seccion.distrito.is_not(None),
                Seccion.nombre_distrito.is_not(None)
            )
            .distinct()
            .order_by(Seccion.distrito)
        )
        
        distrito_map = {}
        distrito_count = 0
        for distrito_id, nombre_distrito in distritos_query:
            # Buscar o crear distrito
            distrito_unit = session.exec(
                select(AdministrativeUnit).where(
                    AdministrativeUnit.unit_type == "DISTRICT",
                    AdministrativeUnit.seccion_distrito_id == distrito_id
                )
            ).first()
            
            if not distrito_unit:
                distrito_unit = AdministrativeUnit(
                    name=nombre_distrito or f"Distrito {distrito_id}",
                    code=str(distrito_id),
                    unit_type="DISTRICT",
                    parent_id=state.id,
                    seccion_distrito_id=distrito_id
                )
                session.add(distrito_unit)
                session.flush()
                distrito_count += 1
                print(f"✓ Creado: {distrito_unit.name} (DISTRICT {distrito_id}) - ID: {distrito_unit.id}")
            else:
                print(f"○ Ya existe: {distrito_unit.name} (DISTRICT {distrito_id}) - ID: {distrito_unit.id}")
            
            distrito_map[distrito_id] = distrito_unit

        session.commit()
        print(f"\nDistritos creados: {distrito_count}")

        # 3. Obtener todos los municipios únicos y asociarlos a distritos
        print("\n" + "-"*60)
        print("CREANDO MUNICIPIOS")
        print("-"*60)
        
        municipios_query = session.exec(
            select(
                Seccion.municipio,
                Seccion.nombre_municipio,
                Seccion.distrito
            )
            .where(
                Seccion.municipio.is_not(None),
                Seccion.nombre_municipio.is_not(None)
            )
            .distinct()
            .order_by(Seccion.municipio)
        )

        municipio_map = {}
        municipio_count = 0
        for municipio_id, nombre_municipio, distrito_id in municipios_query:
            # Buscar o crear municipio
            municipio_unit = session.exec(
                select(AdministrativeUnit).where(
                    AdministrativeUnit.unit_type == "MUNICIPALITY",
                    AdministrativeUnit.seccion_municipio_id == municipio_id
                )
            ).first()
            
            if not municipio_unit:
                # El padre del municipio es el distrito
                parent_id = distrito_map.get(distrito_id).id if distrito_id in distrito_map else state.id
                parent_name = distrito_map.get(distrito_id).name if distrito_id in distrito_map else "Estado"
                
                municipio_unit = AdministrativeUnit(
                    name=nombre_municipio or f"Municipio {municipio_id}",
                    code=str(municipio_id),
                    unit_type="MUNICIPALITY",
                    parent_id=parent_id,
                    seccion_municipio_id=municipio_id,
                    seccion_distrito_id=distrito_id
                )
                session.add(municipio_unit)
                session.flush()
                municipio_count += 1
                print(f"✓ Creado: {municipio_unit.name} (MUNICIPALITY {municipio_id}) bajo {parent_name} - ID: {municipio_unit.id}")
            else:
                print(f"○ Ya existe: {municipio_unit.name} (MUNICIPALITY {municipio_id}) - ID: {municipio_unit.id}")
            
            municipio_map[municipio_id] = municipio_unit

        session.commit()
        print(f"\nMunicipios creados: {municipio_count}")

        # 4. Crear secciones
        print("\n" + "-"*60)
        print("CREANDO SECCIONES (puede tomar unos minutos...)")
        print("-"*60)
        
        secciones = session.exec(
            select(Seccion).order_by(Seccion.id)
        ).all()

        created_sections = 0
        existing_sections = 0
        for idx, seccion in enumerate(secciones, 1):
            section_unit = session.exec(
                select(AdministrativeUnit).where(
                    AdministrativeUnit.unit_type == "SECTION",
                    AdministrativeUnit.code == str(seccion.id)
                )
            ).first()
            
            if not section_unit:
                parent_id = municipio_map.get(seccion.municipio).id if seccion.municipio in municipio_map else state.id
                
                section_unit = AdministrativeUnit(
                    name=f"Sección {seccion.id}",
                    code=str(seccion.id),
                    unit_type="SECTION",
                    parent_id=parent_id,
                    seccion_municipio_id=seccion.municipio,
                    seccion_distrito_id=seccion.distrito
                )
                session.add(section_unit)
                created_sections += 1
                
                # Commit cada 100 secciones para evitar problemas de memoria
                if created_sections % 100 == 0:
                    session.commit()
                    print(f"  → Procesadas {idx}/{len(secciones)} secciones ({created_sections} creadas)...")
            else:
                existing_sections += 1
        
        session.commit()
        print(f"\n✓ Secciones creadas: {created_sections}")
        print(f"○ Secciones existentes: {existing_sections}")

        # Resumen final
        print("\n" + "="*60)
        print("RESUMEN FINAL")
        print("="*60)
        
        counts = {}
        for unit_type in ['STATE', 'DISTRICT', 'MUNICIPALITY', 'SECTION']:
            count = session.exec(
                select(func.count(AdministrativeUnit.id)).where(
                    AdministrativeUnit.unit_type == unit_type
                )
            ).one()
            counts[unit_type] = count
            print(f"{unit_type:15} : {count:5} unidades")
        
        total_units = session.exec(
            select(func.count(AdministrativeUnit.id))
        ).one()
        
        print("-"*60)
        print(f"{'TOTAL':15} : {total_units:5} unidades administrativas")
        print("="*60)


if __name__ == "__main__":
    try:
        populate_administrative_units()
        print("\n✅ Proceso completado exitosamente\n")
    except Exception as e:
        print(f"\n❌ Error durante el proceso: {e}\n")
        import traceback
        traceback.print_exc()
        sys.exit(1)
