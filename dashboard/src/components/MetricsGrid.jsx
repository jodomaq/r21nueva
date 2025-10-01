const formatNumber = (value) =>
  new Intl.NumberFormat('es-MX', { maximumFractionDigits: 1 }).format(value ?? 0)

const progressLabel = (current, total) =>
  total > 0 ? `${formatNumber(current)} de ${formatNumber(total)}` : 'Sin datos'

export default function MetricsGrid({ metrics }) {
  if (!metrics) {
    return (
      <div className="loading-state">Sin métricas disponibles todavía. Registra más comités para iluminar el mapa.</div>
    )
  }

  const municipalityProgress = progressLabel(metrics.municipios_cubiertos, metrics.municipios_meta)
  const sectionsProgress = progressLabel(metrics.secciones_cubiertas, metrics.total_secciones)

  return (
    <div className="metrics-grid">
      <div className="metric-card">
        <span>Comités organizados</span>
        <strong>{formatNumber(metrics.total_committees)}</strong>
        <span>Promovidos registrados: {formatNumber(metrics.total_promovidos)}</span>
      </div>
      <div className="metric-card">
        <span>Municipios con presencia</span>
        <strong>{formatNumber(metrics.porcentaje_municipios)}%</strong>
        <span>{municipalityProgress} municipios</span>
      </div>
      <div className="metric-card">
        <span>Secciones cubiertas</span>
        <strong>{formatNumber(metrics.porcentaje_secciones)}%</strong>
        <span>{sectionsProgress} secciones</span>
      </div>
      <div className="metric-card">
        <span>Documentos cargados para respaldo</span>
        <strong>{formatNumber(metrics.total_documentos)}</strong>
        <span>Memoria viva de cada reunión territorial</span>
      </div>
    </div>
  )
}
