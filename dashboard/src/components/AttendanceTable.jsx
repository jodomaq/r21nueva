import { useState } from 'react'

const RecordNode = ({ record }) => (
  <li className="tree-node" style={{ marginLeft: '1.5rem', listStyle: 'none' }}>
    <div style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.02)', borderRadius: '4px', marginBottom: '4px' }}>
      <div style={{ fontWeight: 600 }}>{record.name || 'Sin nombre'}</div>
      <div style={{ fontSize: '0.85rem', color: '#555' }}>
        {record.email} • {new Date(record.created_at).toLocaleTimeString('es-MX')}
      </div>
      <div style={{ fontSize: '0.75rem', color: '#888' }}>
        {record.device_id}
      </div>
    </div>
  </li>
)

const GroupNode = ({ label, count, children }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <li className="tree-node" style={{ listStyle: 'none', marginBottom: '0.5rem' }}>
      <div className="tree-node__label" style={{ display: 'flex', alignItems: 'center' }}>
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
            fontWeight: 'bold'
          }}
        >
          {isExpanded ? '−' : '+'}
        </span>
        <span onClick={() => setIsExpanded(!isExpanded)} style={{ cursor: 'pointer', fontWeight: 500 }}>
          {label}
        </span>
        {count !== undefined && (
          <span style={{ marginLeft: '8px', fontSize: '0.8rem', color: '#666', background: '#eee', padding: '0 6px', borderRadius: '10px' }}>
            {count}
          </span>
        )}
      </div>
      {isExpanded && (
        <ul style={{ paddingLeft: '0.5rem', marginTop: '0.5rem' }}>
          {children}
        </ul>
      )}
    </li>
  )
}

export default function AttendanceTable({ records }) {
  if (!records.length) {
    return <div className="loading-state">Aún no se registran asistencias con geolocalización.</div>
  }

  // Grouping logic
  const groups = records.reduce((acc, record) => {
    const d = new Date(record.created_at)
    // Group 1: Date
    const dateKey = d.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    const dateLabel = dateKey.charAt(0).toUpperCase() + dateKey.slice(1) // Capitalize

    if (!acc[dateLabel]) acc[dateLabel] = {}

    // Group 2: Location (Integer)
    let locKey = 'Sin geolocalización'
    if (record.latitude != null && record.longitude != null) {
      locKey = `Lat: ${Math.trunc(record.latitude)}, Lon: ${Math.trunc(record.longitude)}`
    }

    if (!acc[dateLabel][locKey]) acc[dateLabel][locKey] = []

    acc[dateLabel][locKey].push(record)
    return acc
  }, {})

  return (
    <div className="tree-container">
      <ul style={{ paddingLeft: 0 }}>
        {Object.entries(groups).map(([dateLabel, locGroups]) => (
          <GroupNode key={dateLabel} label={dateLabel} count={Object.values(locGroups).flat().length}>
            {Object.entries(locGroups).map(([locLabel, groupRecords]) => (
              <GroupNode key={locLabel} label={locLabel} count={groupRecords.length}>
                {groupRecords.map((record) => (
                  <RecordNode key={record.id} record={record} />
                ))}
              </GroupNode>
            ))}
          </GroupNode>
        ))}
      </ul>
    </div>
  )
}
