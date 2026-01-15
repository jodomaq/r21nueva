import { useState, Fragment } from 'react'

const UNIT_TRANSLATIONS = {
    STATE: 'Estado',
    REGION: 'Región',
    DISTRICT: 'Distrito',
    MUNICIPALITY: 'Municipio',
    SECTION: 'Sección',
}

const StatsRow = ({ node, level = 0 }) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const hasChildren = node.children && node.children.length > 0

    // Assignment logic: take the first one as the primary "in charge"
    const primaryAssignment = node.assignments && node.assignments.length > 0 ? node.assignments[0] : null

    // Columns data
    const unitName = node.code ? `${node.name} (${node.code})` : node.name
    const personName = primaryAssignment ? primaryAssignment.user_name : '—'
    const roleName = primaryAssignment ? primaryAssignment.role_label : '—'

    // Indentation for tree structure
    const paddingLeft = `${level * 20}px`

    return (
        <Fragment>
            <tr className="tree-row">
                {/* Column 1: Unit Name (Tree control) */}
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
                            <span style={{ fontWeight: 600 }}>
                                {unitName}
                            </span>
                            <span style={{ fontSize: '0.75em', color: '#999' }}>
                                {UNIT_TRANSLATIONS[node.unit_type] || node.unit_type}
                            </span>
                        </div>
                    </div>
                </td>

                {/* Column 2: Committees */}
                <td style={{ textAlign: 'center' }}>
                    <strong>{node.total_committees?.toLocaleString('es-MX') || 0}</strong>
                </td>

                {/* Column 3: Promoted */}
                <td style={{ textAlign: 'center' }}>
                    <strong>{node.total_members?.toLocaleString('es-MX') || 0}</strong>
                </td>

                {/* Column 4: Person in Charge */}
                <td>
                    {primaryAssignment ? (
                        <span>{personName}</span>
                    ) : (
                        <span className="text-muted" style={{ color: '#999', fontStyle: 'italic' }}>Roberto Reyes</span>
                    )}
                </td>

                {/* Column 5: Role */}
                <td>
                    {primaryAssignment ? (
                        <span className="badge badge-role">
                            {roleName}
                        </span>
                    ) : null}
                </td>
            </tr>
            {hasChildren && isExpanded && node.children.map(child => (
                <StatsRow key={child.id} node={child} level={level + 1} />
            ))}
        </Fragment>
    )
}

export default function TerritorialStructureStats({ nodes }) {
    if (!nodes || !nodes.length) {
        return <div className="loading-state">Calculando estructura territorial y estadísticas…</div>
    }

    return (
        <div className="table-container">
            <table className="tree-table">
                <thead>
                    <tr>
                        <th style={{ width: '35%' }}>Unidad Territorial</th>
                        <th style={{ width: '10%', textAlign: 'center' }}>Comités</th>
                        <th style={{ width: '10%', textAlign: 'center' }}>Integrantes de comités</th>
                        <th style={{ width: '25%' }}>Encargado</th>
                        <th style={{ width: '20%' }}>Rol</th>
                    </tr>
                </thead>
                <tbody>
                    {nodes.map((node) => (
                        <StatsRow key={node.id} node={node} />
                    ))}
                </tbody>
            </table>
        </div>
    )
}
