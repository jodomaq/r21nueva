import { useState } from 'react'

const ROLE_SHORT = {
  1: 'Coord. Estatal',
  2: 'Delegación Regional',
  3: 'Coord. Distrital',
  4: 'Coord. Municipal',
  5: 'Coord. Seccional',
  6: 'Presidencia Comité',
}

const UNIT_TRANSLATIONS = {
  STATE: 'Estado',
  REGION: 'Región',
  DISTRICT: 'Distrito',
  MUNICIPALITY: 'Municipio',
  SECTION: 'Sección',
}

const Node = ({ node }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasChildren = node.children && node.children.length > 0

  return (
    <li className="tree-node">
      <div className="tree-node__label">
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          {hasChildren && (
            <span
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
              style={{
                cursor: 'pointer',
                marginRight: '8px',
                userSelect: 'none',
                lineHeight: '1.5',
                fontSize: '14px',
                display: 'inline-block',
                width: '12px',
                textAlign: 'center',
              }}
            >
              {isExpanded ? '−' : '+'}
            </span>
          )}
          <div>
            <strong>{node.name}</strong>
            <div className="tag">
              {UNIT_TRANSLATIONS[node.unit_type] || node.unit_type}
            </div>
          </div>
        </div>
        {node.assignments?.length ? (
          <div className="tree-node__assignments">
            {node.assignments.map((assignment) => (
              <span key={`${node.id}-${assignment.user_id}`}>
                {assignment.user_name} ·{' '}
                {ROLE_SHORT[assignment.role] || assignment.role_label}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      {hasChildren && isExpanded ? (
        <ul>
          {node.children.map((child) => (
            <Node key={child.id} node={child} />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

export default function AdministrativeTreeView({ nodes }) {
  if (!nodes.length) {
    return <div className="loading-state">Construyendo la red territorial…</div>
  }

  return (
    <div className="tree-container">
      <ul style={{ paddingLeft: 0 }}>
        {nodes.map((node) => (
          <Node key={node.id} node={node} />
        ))}
      </ul>
    </div>
  )
}
