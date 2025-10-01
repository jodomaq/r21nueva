const formatDate = (value) => new Date(value).toLocaleDateString('es-MX', { dateStyle: 'medium' })

export default function UserAssignmentsTable({ assignments }) {
  if (!assignments.length) {
    return <div className="loading-state">Sin roles configurados todavía. Asigna responsables para activar cada estructura.</div>
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Rol</th>
            <th>Unidad</th>
            <th>Tipo</th>
            <th>Desde</th>
          </tr>
        </thead>
        <tbody>
          {assignments.slice(0, 40).map((assignment) => (
            <tr key={assignment.assignment_id}>
              <td>{assignment.user_name}</td>
              <td>{assignment.role_label}</td>
              <td>{assignment.administrative_unit_name}</td>
              <td>{assignment.administrative_unit_type}</td>
              <td>{formatDate(assignment.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
