from sqlmodel import Session, select, func
from app.database import engine
from app import models

def check_db():
    with Session(engine) as session:
        # Check AdministrativeUnit
        unit_count = session.exec(select(func.count(models.AdministrativeUnit.id))).one()
        print(f"AdministrativeUnit count: {unit_count}")

        # Check Committees linked to AdministrativeUnit
        linked_committees = session.exec(select(func.count(models.Committee.id)).where(models.Committee.administrative_unit_id.is_not(None))).one()
        print(f"Committees with administrative_unit_id: {linked_committees}")

        # Check total committees
        total_committees = session.exec(select(func.count(models.Committee.id))).one()
        print(f"Total Committees: {total_committees}")

        # Check committees with section_number
        sections_committees = session.exec(select(func.count(models.Committee.id)).where(models.Committee.section_number.is_not(None))).one()
        print(f"Committees with section_number: {sections_committees}")
        
        # Check Sections count
        section_count = session.exec(select(func.count(models.Seccion.id))).one()
        print(f"Seccion table count: {section_count}")

if __name__ == "__main__":
    check_db()
