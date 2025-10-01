import './App.css'
import 'leaflet/dist/leaflet.css'
import { FaDownload, FaSyncAlt } from 'react-icons/fa'
import logo from './assets/logoR21blanco.png'
import CountdownClock from './components/CountdownClock'
import MetricsGrid from './components/MetricsGrid'
import ChartsPanel from './components/ChartsPanel'
import AttendanceTable from './components/AttendanceTable'
import AdministrativeTreeView from './components/AdministrativeTreeView'
import UserAssignmentsTable from './components/UserAssignmentsTable'
import CommitteeExplorer from './components/CommitteeExplorer'
import DocumentsGallery from './components/DocumentsGallery'
import PresidentsList from './components/PresidentsList'
import MapView from './components/MapView'
import StatusBanner from './components/StatusBanner'
import { getExportUrls } from './api/client'
import { useDashboardData } from './hooks/useDashboardData'

const electionDate = new Date('2027-07-04T08:00:00-06:00')

function App() {
  const {
    attendance,
    stats,
    administrativeTree,
    assignments,
    committees,
    documents,
    metrics,
    mapPoints,
    presidents,
    loading,
    error,
    refetchAll,
  } = useDashboardData()

  const exportUrls = getExportUrls()

  const handleExcelDownload = () => window.open(exportUrls.committeesExcel, '_blank', 'noopener')
  const handleActaDownload = (committeeId) => window.open(exportUrls.committeeActa(committeeId), '_blank', 'noopener')

  return (
    <div className="dashboard-app">
      <header className="dashboard-header">
        <div className="dashboard-header__identity">
          <img src={logo} alt="R21" />
          <div>
            <h1>Dashboard estratégico R21 MORENA en Michoacán</h1>
            <p>
              Seguimos construyendo el Segundo Piso de la Cuarta Transformación con presencia territorial, organización y esperanza.
            </p>
          </div>
        </div>
        <div className="dashboard-header__actions">
          <CountdownClock targetDate={electionDate} />
          <div className="button-row">
            <button type="button" className="primary-button" onClick={handleExcelDownload}>
              <FaDownload /> Exportar comités (Excel)
            </button>
            <button type="button" className="secondary-button" onClick={refetchAll}>
              <FaSyncAlt /> Actualizar datos
            </button>
          </div>
        </div>
      </header>

      {error ? <StatusBanner type="error" message={`Error al cargar datos: ${error.message || error}`} /> : null}
      {loading ? <StatusBanner message="Actualizando la información territorial…" /> : null}

      <section className="card-section">
        <h2>Impulso general del movimiento</h2>
        <MetricsGrid metrics={metrics} />
      </section>

      <section className="card-section">
        <h2>Mapas y proporciones de comités</h2>
        <ChartsPanel stats={stats} />
      </section>

      <section className="sections-grid">
        <div className="card-section">
          <h2>Asistencia validada en eventos</h2>
          <AttendanceTable records={attendance} />
        </div>
        <div className="card-section">
          <h2>Mapa de reuniones en Michoacán</h2>
          <MapView points={mapPoints} />
        </div>
      </section>

      <section className="sections-grid">
        <div className="card-section">
          <h2>Estructura territorial R21</h2>
          <AdministrativeTreeView nodes={administrativeTree} />
        </div>
        <div className="card-section">
          <h2>Coordinaciones y roles</h2>
          <UserAssignmentsTable assignments={assignments} />
        </div>
      </section>

      <section className="card-section">
        <h2>Comités con detalle y actas</h2>
        <CommitteeExplorer committees={committees} onDownloadActa={handleActaDownload} />
      </section>

      <section className="sections-grid">
        <div className="card-section">
          <h2>Galería de documentos</h2>
          <DocumentsGallery documents={documents} />
        </div>
        <div className="card-section">
          <h2>Presidentes y enlaces directos</h2>
          <PresidentsList presidents={presidents} />
        </div>
      </section>
    </div>
  )
}

export default App
