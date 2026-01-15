import { useState, useEffect, Fragment } from 'react'
import { fetchMunicipalStats } from '../api/client'

const UNIT_TRANSLATIONS = {
    STATE: 'Estado',
    REGION: 'Región',
    DISTRICT: 'Distrito',
    MUNICIPALITY: 'Municipio',
    SECTION: 'Sección',
}

// Recursive row component
const StatRow = ({ node, level = 0 }) => {
    // Default expanded only for top level? Or collapsed?
    // User requested: "Abajo de los municipios que se despliequen las secciones"
    // Usually lists start collapsed, but let's default to collapsed to save space.
    const [isExpanded, setIsExpanded] = useState(false)
    const hasChildren = node.children && node.children.length > 0

    // Formatting
    const unitName = node.code ? `${node.name}` : node.name
    const paddingLeft = `${level * 20}px`

    return (
        <Fragment>
            <tr className={level === 0 ? "fw-bold" : ""}>
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
                            <span>{unitName}</span>
                            {/* Optional: Show role/person if needed, but not requested in prompt */}
                        </div>
                    </div>
                </td>
                <td style={{ textAlign: 'center' }}>
                    {node.total_committees?.toLocaleString('es-MX')}
                </td>
                <td style={{ textAlign: 'center' }}>
                    {node.total_members?.toLocaleString('es-MX')}
                </td>
            </tr>
            {hasChildren && isExpanded && node.children.map(child => (
                <StatRow key={child.id} node={child} level={level + 1} />
            ))}
        </Fragment>
    )
}

export default function MunicipalStructureStats() {
    const [nodes, setNodes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        let mounted = true
        fetchMunicipalStats()
            .then(data => {
                if (mounted) {
                    setNodes(data)
                    setLoading(false)
                }
            })
            .catch(err => {
                if (mounted) {
                    console.error("Error fetching municipal stats:", err)
                    setError("Error al cargar estadísticas municipales")
                    setLoading(false)
                }
            })
        return () => { mounted = false }
    }, [])

    if (loading) return <div className="loading-state">Cargando municipios…</div>
    if (error) return <div className="error-message">{error}</div>
    if (!nodes || nodes.length === 0) return <div className="empty-state">No se encontraron municipios con comités activos.</div>

    return (
        <div className="table-container">
            <table className="tree-table">
                <thead>
                    <tr>
                        <th style={{ width: '50%' }}>Nombre del municipio / Sección</th>
                        <th style={{ width: '25%', textAlign: 'center' }}>Cantidad de Comités</th>
                        <th style={{ width: '25%', textAlign: 'center' }}>Cantidad de Integrantes de Comités</th>
                    </tr>
                </thead>
                <tbody>
                    {nodes.map(node => (
                        <StatRow key={node.id} node={node} />
                    ))}
                </tbody>
            </table>
        </div>
    )
}
