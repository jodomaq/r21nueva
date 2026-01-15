import { useState, Fragment } from 'react'

const UNIT_TRANSLATIONS = {
  STATE: 'Estado',
  REGION: 'Región',
  DISTRICT: 'Distrito',
  MUNICIPALITY: 'Municipio',
  SECTION: 'Sección',
}


const UnitRow = ({ node, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasChildren = node.children && node.children.length > 0

  // Determine display name and role
  // If assignments exists, use the first one (primary coordinator)
  // Otherwise use the unit name and indicate vacancy
  const primaryAssignment = node.assignments && node.assignments.length > 0 ? node.assignments[0] : null

  const displayName = primaryAssignment ? primaryAssignment.user_name : node.name
  const displayRole = primaryAssignment ? primaryAssignment.role_label : (UNIT_TRANSLATIONS[node.unit_type] || node.unit_type)

  // Indentation for tree structure
  const paddingLeft = `${level * 20}px`

  return (
    <Fragment>
      <tr className="tree-row">
        <td style={{ paddingLeft }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {hasChildren ? (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  width: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#666'
                }}
              >
                {isExpanded ? '−' : '+'}
              </button>
            ) : (
              <span style={{ width: '28px' }}></span>
            )}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: primaryAssignment ? 600 : 400 }}>
                {displayName}
              </span>
              {!primaryAssignment && (
                <span style={{ fontSize: '0.75em', color: '#999' }}>
                  {UNIT_TRANSLATIONS[node.unit_type] || node.unit_type}
                </span>
              )}
            </div>
          </div>
        </td>
        <td>
          <span className={`badge ${primaryAssignment ? 'badge-role' : 'badge-neutral'}`}>
            {displayRole}
          </span>
        </td>
        <td style={{ textAlign: 'center' }}>
          <strong>{node.total_committees?.toLocaleString('es-MX') || 0}</strong>
        </td>
        <td style={{ textAlign: 'center' }}>
          <strong>{node.total_members?.toLocaleString('es-MX') || 0}</strong>
        </td>
      </tr>
      {hasChildren && isExpanded && node.children.map(child => (
        <UnitRow key={child.id} node={child} level={level + 1} />
      ))}
    </Fragment>
  )
}

export default function UserAssignmentsTable({ nodes }) {
  if (!nodes || !nodes.length) {
    return <div className="loading-state">Calculando estructura territorial y estadísticas…</div>
  }

  return (
    <div className="table-container">
      <table className="tree-table">
        <thead>
          <tr>
            <th style={{ width: '40%' }}>Nombre / Unidad</th>
            <th style={{ width: '30%' }}>Rol</th>
            <th style={{ width: '15%', textAlign: 'center' }}>Comités</th>
            <th style={{ width: '15%', textAlign: 'center' }}>Integrantes de comités</th>
          </tr>
        </thead>
        <tbody>
          {nodes.map((node) => (
            <UnitRow key={node.id} node={node} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
