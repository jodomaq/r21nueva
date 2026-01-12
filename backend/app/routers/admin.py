"""
Router para administración de usuarios, unidades administrativas y asignaciones.
Solo accesible para el usuario administrador (jodomaq@gmail.com)
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, func, or_
from app.database import get_session
from app.dependencies import get_current_user
from app.models import User, AdministrativeUnit, UserAssignment, Seccion
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/admin", tags=["admin"])

# Lista de emails de administradores permitidos
ADMIN_EMAILS = [
    "jodomaq@gmail.com",
    "karinarojas2597@gmail.com",
    "raul_moron_orozco@hotmail.com",
    "cosarireyes@gmail.com"
]


def verify_admin(current_user: User = Depends(get_current_user)):
    """Verifica que el usuario actual sea administrador"""
    if not current_user.email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el administrador puede acceder a este recurso"
        )
    
    # Verificación case-insensitive
    is_admin = any(
        admin_email.lower() == current_user.email.lower() 
        for admin_email in ADMIN_EMAILS
    )
    
    if not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el administrador puede acceder a este recurso"
        )
    return current_user


# ========== SCHEMAS ==========
class UserCreate(BaseModel):
    email: str
    name: str
    phone: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    phone: Optional[str]
    picture_url: Optional[str]
    created_at: datetime


class AdministrativeUnitResponse(BaseModel):
    id: int
    name: str
    code: Optional[str]
    unit_type: str
    parent_id: Optional[int]
    parent_name: Optional[str] = None
    seccion_municipio_id: Optional[int]
    seccion_distrito_id: Optional[int]
    children_count: int = 0
    assignments_count: int = 0


class UserAssignmentCreate(BaseModel):
    user_id: int
    administrative_unit_id: int
    role: int  # 1=ESTATAL, 2=REGIONAL, 3=DISTRITAL, 4=MUNICIPAL, 5=SECCIONAL, 6=PRESIDENTE


class UserAssignmentResponse(BaseModel):
    id: int
    user_id: int
    user_email: str
    user_name: str
    administrative_unit_id: int
    unit_name: str
    unit_type: str
    role: int
    role_name: str
    created_at: datetime


class SeccionResponse(BaseModel):
    id: int
    municipio: Optional[int]
    nombre_municipio: Optional[str]
    distrito: Optional[int]
    nombre_distrito: Optional[str]
    distrito_federal: Optional[int]


# ========== ROLE NAMES ==========
ROLE_NAMES = {
    1: "Coordinador Estatal",
    2: "Delegado Regional",
    3: "Coordinador Distrital",
    4: "Coordinador Municipal",
    5: "Coordinador Seccional",
    6: "Presidente de Comité"
}


# ========== USERS ENDPOINTS ==========
@router.get("/users", response_model=List[UserResponse])
def get_users(
    session: Session = Depends(get_session),
    _admin: User = Depends(verify_admin)
):
    """Obtiene todos los usuarios del sistema"""
    users = session.exec(select(User).order_by(User.name)).all()
    return users


@router.post("/users", response_model=UserResponse)
def create_user(
    user_data: UserCreate,
    session: Session = Depends(get_session),
    _admin: User = Depends(verify_admin)
):
    """Crea un nuevo usuario"""
    # Verificar que no exista
    existing = session.exec(
        select(User).where(User.email == user_data.email)
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un usuario con ese correo electrónico"
        )
    
    user = User(
        email=user_data.email,
        name=user_data.name,
        phone=user_data.phone
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    session: Session = Depends(get_session),
    _admin: User = Depends(verify_admin)
):
    """Elimina un usuario y todas sus asignaciones"""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # No permitir eliminar a ningún administrador
    is_admin = any(
        admin_email.lower() == user.email.lower() 
        for admin_email in ADMIN_EMAILS
    )
    if is_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede eliminar a un usuario administrador"
        )
    
    # Eliminar asignaciones
    session.exec(
        select(UserAssignment).where(UserAssignment.user_id == user_id)
    ).all()
    for assignment in session.exec(
        select(UserAssignment).where(UserAssignment.user_id == user_id)
    ).all():
        session.delete(assignment)
    
    session.delete(user)
    session.commit()
    return {"success": True, "message": "Usuario eliminado"}


# ========== ADMINISTRATIVE UNITS ENDPOINTS ==========
@router.get("/administrative-units", response_model=List[AdministrativeUnitResponse])
def get_administrative_units(
    unit_type: Optional[str] = None,
    parent_id: Optional[int] = None,
    search: Optional[str] = None,
    session: Session = Depends(get_session),
    _admin: User = Depends(verify_admin)
):
    """Obtiene unidades administrativas con filtros opcionales"""
    query = select(AdministrativeUnit)
    
    if unit_type:
        query = query.where(AdministrativeUnit.unit_type == unit_type)
    
    if parent_id is not None:
        query = query.where(AdministrativeUnit.parent_id == parent_id)
    
    if search:
        query = query.where(
            or_(
                AdministrativeUnit.name.contains(search),
                AdministrativeUnit.code.contains(search)
            )
        )
    
    query = query.order_by(AdministrativeUnit.name)
    units = session.exec(query).all()
    
    # Enriquecer con información adicional
    result = []
    for unit in units:
        children_count = session.exec(
            select(func.count(AdministrativeUnit.id)).where(
                AdministrativeUnit.parent_id == unit.id
            )
        ).one()
        
        assignments_count = session.exec(
            select(func.count(UserAssignment.id)).where(
                UserAssignment.administrative_unit_id == unit.id
            )
        ).one()
        
        parent_name = None
        if unit.parent_id:
            parent = session.get(AdministrativeUnit, unit.parent_id)
            parent_name = parent.name if parent else None
        
        result.append(AdministrativeUnitResponse(
            id=unit.id,
            name=unit.name,
            code=unit.code,
            unit_type=unit.unit_type,
            parent_id=unit.parent_id,
            parent_name=parent_name,
            seccion_municipio_id=unit.seccion_municipio_id,
            seccion_distrito_id=unit.seccion_distrito_id,
            children_count=children_count,
            assignments_count=assignments_count
        ))
    
    return result


@router.get("/administrative-units/{unit_id}", response_model=AdministrativeUnitResponse)
def get_administrative_unit(
    unit_id: int,
    session: Session = Depends(get_session),
    _admin: User = Depends(verify_admin)
):
    """Obtiene una unidad administrativa específica"""
    unit = session.get(AdministrativeUnit, unit_id)
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unidad administrativa no encontrada"
        )
    
    children_count = session.exec(
        select(func.count(AdministrativeUnit.id)).where(
            AdministrativeUnit.parent_id == unit.id
        )
    ).one()
    
    assignments_count = session.exec(
        select(func.count(UserAssignment.id)).where(
            UserAssignment.administrative_unit_id == unit.id
        )
    ).one()
    
    parent_name = None
    if unit.parent_id:
        parent = session.get(AdministrativeUnit, unit.parent_id)
        parent_name = parent.name if parent else None
    
    return AdministrativeUnitResponse(
        id=unit.id,
        name=unit.name,
        code=unit.code,
        unit_type=unit.unit_type,
        parent_id=unit.parent_id,
        parent_name=parent_name,
        seccion_municipio_id=unit.seccion_municipio_id,
        seccion_distrito_id=unit.seccion_distrito_id,
        children_count=children_count,
        assignments_count=assignments_count
    )


# ========== USER ASSIGNMENTS ENDPOINTS ==========
@router.get("/assignments", response_model=List[UserAssignmentResponse])
def get_assignments(
    user_id: Optional[int] = None,
    administrative_unit_id: Optional[int] = None,
    role: Optional[int] = None,
    session: Session = Depends(get_session),
    _admin: User = Depends(verify_admin)
):
    """Obtiene asignaciones de usuarios con filtros opcionales"""
    query = select(UserAssignment)
    
    if user_id:
        query = query.where(UserAssignment.user_id == user_id)
    
    if administrative_unit_id:
        query = query.where(UserAssignment.administrative_unit_id == administrative_unit_id)
    
    if role:
        query = query.where(UserAssignment.role == role)
    
    assignments = session.exec(query.order_by(UserAssignment.created_at.desc())).all()
    
    # Enriquecer con información de usuario y unidad
    result = []
    for assignment in assignments:
        user = session.get(User, assignment.user_id)
        unit = session.get(AdministrativeUnit, assignment.administrative_unit_id)
        
        if user and unit:
            result.append(UserAssignmentResponse(
                id=assignment.id,
                user_id=assignment.user_id,
                user_email=user.email,
                user_name=user.name,
                administrative_unit_id=assignment.administrative_unit_id,
                unit_name=unit.name,
                unit_type=unit.unit_type,
                role=assignment.role,
                role_name=ROLE_NAMES.get(assignment.role, "Desconocido"),
                created_at=assignment.created_at
            ))
    
    return result


@router.post("/assignments", response_model=UserAssignmentResponse)
def create_assignment(
    assignment_data: UserAssignmentCreate,
    session: Session = Depends(get_session),
    _admin: User = Depends(verify_admin)
):
    """Crea una nueva asignación de usuario a unidad administrativa"""
    # Verificar que existan el usuario y la unidad
    user = session.get(User, assignment_data.user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    unit = session.get(AdministrativeUnit, assignment_data.administrative_unit_id)
    if not unit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unidad administrativa no encontrada"
        )
    
    # Verificar que no exista ya esta asignación
    existing = session.exec(
        select(UserAssignment).where(
            UserAssignment.user_id == assignment_data.user_id,
            UserAssignment.administrative_unit_id == assignment_data.administrative_unit_id,
            UserAssignment.role == assignment_data.role
        )
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Esta asignación ya existe"
        )
    
    assignment = UserAssignment(
        user_id=assignment_data.user_id,
        administrative_unit_id=assignment_data.administrative_unit_id,
        role=assignment_data.role
    )
    session.add(assignment)
    session.commit()
    session.refresh(assignment)
    
    return UserAssignmentResponse(
        id=assignment.id,
        user_id=assignment.user_id,
        user_email=user.email,
        user_name=user.name,
        administrative_unit_id=assignment.administrative_unit_id,
        unit_name=unit.name,
        unit_type=unit.unit_type,
        role=assignment.role,
        role_name=ROLE_NAMES.get(assignment.role, "Desconocido"),
        created_at=assignment.created_at
    )


@router.delete("/assignments/{assignment_id}")
def delete_assignment(
    assignment_id: int,
    session: Session = Depends(get_session),
    _admin: User = Depends(verify_admin)
):
    """Elimina una asignación"""
    assignment = session.get(UserAssignment, assignment_id)
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Asignación no encontrada"
        )
    
    session.delete(assignment)
    session.commit()
    return {"success": True, "message": "Asignación eliminada"}


# ========== SECCIONES ENDPOINTS ==========
@router.get("/secciones", response_model=List[SeccionResponse])
def get_secciones(
    municipio: Optional[int] = None,
    distrito: Optional[int] = None,
    limit: int = 100,
    offset: int = 0,
    session: Session = Depends(get_session),
    _admin: User = Depends(verify_admin)
):
    """Obtiene secciones con filtros opcionales"""
    query = select(Seccion)
    
    if municipio:
        query = query.where(Seccion.municipio == municipio)
    
    if distrito:
        query = query.where(Seccion.distrito == distrito)
    
    query = query.order_by(Seccion.id).offset(offset).limit(limit)
    secciones = session.exec(query).all()
    
    return secciones


@router.get("/secciones/municipios")
def get_municipios_from_secciones(
    session: Session = Depends(get_session),
    _admin: User = Depends(verify_admin)
):
    """Obtiene la lista de municipios únicos de la tabla Seccion"""
    municipios = session.exec(
        select(
            Seccion.municipio,
            Seccion.nombre_municipio
        )
        .where(
            Seccion.municipio.is_not(None),
            Seccion.nombre_municipio.is_not(None)
        )
        .distinct()
        .order_by(Seccion.nombre_municipio)
    ).all()
    
    return [
        {"id": mun_id, "nombre": nombre}
        for mun_id, nombre in municipios
    ]


@router.get("/secciones/distritos")
def get_distritos_from_secciones(
    session: Session = Depends(get_session),
    _admin: User = Depends(verify_admin)
):
    """Obtiene la lista de distritos únicos de la tabla Seccion"""
    distritos = session.exec(
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
    ).all()
    
    return [
        {"id": dist_id, "nombre": nombre}
        for dist_id, nombre in distritos
    ]


# ========== STATISTICS ENDPOINTS ==========
@router.get("/stats")
def get_admin_stats(
    session: Session = Depends(get_session),
    _admin: User = Depends(verify_admin)
):
    """Obtiene estadísticas generales del sistema"""
    total_users = session.exec(select(func.count(User.id))).one()
    total_units = session.exec(select(func.count(AdministrativeUnit.id))).one()
    total_assignments = session.exec(select(func.count(UserAssignment.id))).one()
    total_secciones = session.exec(select(func.count(Seccion.id))).one()
    
    units_by_type = {}
    for unit_type in ['STATE', 'REGION', 'DISTRICT', 'MUNICIPALITY', 'SECTION']:
        count = session.exec(
            select(func.count(AdministrativeUnit.id)).where(
                AdministrativeUnit.unit_type == unit_type
            )
        ).one()
        units_by_type[unit_type] = count
    
    return {
        "total_users": total_users,
        "total_administrative_units": total_units,
        "total_assignments": total_assignments,
        "total_secciones": total_secciones,
        "units_by_type": units_by_type
    }
