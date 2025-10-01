const ROLE_SHORT = {
  1: 'Coord. Estatal',
  2: 'Delegación Regional',
  3: 'Coord. Distrital',
  4: 'Coord. Municipal',
  5: 'Coord. Seccional',
  6: 'Presidencia Comité',
}

const Node = ({ node }) => (
  <li className="tree-node">
    <div className="tree-node__label">
      <div>
        <strong>{node.name}</strong>
        <div className="tag">{node.unit_type}</div>
      </div>
      {node.assignments?.length ? (
        <div className="tree-node__assignments">
          {node.assignments.map((assignment) => (
            <span key={`${node.id}-${assignment.user_id}`}>
              {assignment.user_name} · {ROLE_SHORT[assignment.role] || assignment.role_label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
    {node.children?.length ? (
      <ul>
        {node.children.map((child) => (
          <Node key={child.id} node={child} />
        ))}
      </ul>
    ) : null}
  </li>
)

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
