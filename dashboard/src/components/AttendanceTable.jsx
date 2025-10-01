const formatDate = (value) => new Date(value).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })

export default function AttendanceTable({ records }) {
  if (!records.length) {
    return <div className="loading-state">Aún no se registran asistencias con geolocalización.</div>
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Fecha</th>
            <th>Dispositivo</th>
            <th>Ubicación</th>
          </tr>
        </thead>
        <tbody>
          {records.slice(0, 25).map((attendance) => (
            <tr key={attendance.id}>
              <td>{attendance.name || 'Sin nombre'}</td>
              <td>{attendance.email}</td>
              <td>{formatDate(attendance.created_at)}</td>
              <td>{attendance.device_id}</td>
              <td>
                {attendance.latitude && attendance.longitude
                  ? `${attendance.latitude}, ${attendance.longitude}`
                  : 'Sin geolocalización'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
