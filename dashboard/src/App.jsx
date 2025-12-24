import { useState } from 'react'
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
import {
  downloadCommitteeActa,
  downloadCommitteesExcel,
} from './api/client'
import { useDashboardData } from './hooks/useDashboardData'
import { useAuth, LoginScreen } from './context/AuthContext.jsx'

const electionDate = new Date('2027-07-04T08:00:00-06:00')

const ROLE_LABELS = {
  1: 'Coordinación Estatal',
  2: 'Delegación Regional',
  3: 'Coordinación Distrital',
  4: 'Coordinación Municipal',
  5: 'Coordinación Seccional',
  6: 'Presidencia de Comité',
}

const extractFilename = (contentDisposition, fallback) => {
  if (!contentDisposition) return fallback
  const unicodeMatch = contentDisposition.match(/filename\*=(?:UTF-8''|)([^;]+)/i)
  if (unicodeMatch && unicodeMatch[1]) {
    try {
      return decodeURIComponent(unicodeMatch[1].replace(/"/g, '').trim()) || fallback
    } catch (error) {
      return unicodeMatch[1].replace(/"/g, '').trim() || fallback
    }
  }
  const asciiMatch = contentDisposition.match(/filename="?([^";]+)"?/i)
  if (asciiMatch && asciiMatch[1]) {
    return asciiMatch[1].trim()
  }
  return fallback
}

const triggerDownload = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

function DashboardContent() {
  const [downloadError, setDownloadError] = useState(null)
  const {
    attendance,
    stats,
    administrativeTree,
    fullAdministrativeTree,
    assignments,
    committees,
    documents,
    metrics,
    mapPoints,
    presidents,
    loading,
    error,
    refetchAll,
  } = useDashboardData(true)

  const handleExcelDownload = async () => {
    try {
      setDownloadError(null)
      const response = await downloadCommitteesExcel()
      const filename = extractFilename(response.headers['content-disposition'], 'comites_r21.xlsx')
      triggerDownload(response.data, filename)
    } catch (err) {
      const message = err?.response?.data?.detail || 'No se pudo descargar el archivo de exportación.'
      setDownloadError(message)
      // eslint-disable-next-line no-console
      console.error('[Dashboard] Error al descargar Excel', err)
    }
  }

  const handleActaDownload = async (committeeId) => {
    try {
      setDownloadError(null)
      const response = await downloadCommitteeActa(committeeId)
      const filename = extractFilename(response.headers['content-disposition'], `acta_comite_${committeeId}.pdf`)
      triggerDownload(response.data, filename)
    } catch (err) {
      const message = err?.response?.data?.detail || 'No se pudo descargar el acta del comité seleccionado.'
      setDownloadError(message)
      // eslint-disable-next-line no-console
      console.error('[Dashboard] Error al descargar acta', err)
    }
  }

  return (
    <div className="dashboard-app">
      <header className="dashboard-header">
        <div className="dashboard-header__identity">
          <a href="https://plataformar21.mx/" target="_blank" rel="noopener noreferrer">
            <img src={logo} alt="R21" />
          </a>
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

      {downloadError ? <StatusBanner type="error" message={downloadError} /> : null}
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
          <AdministrativeTreeView nodes={fullAdministrativeTree} />
        </div>
        <div className="card-section">
          <h2>Totales por unidad</h2>
          <UserAssignmentsTable nodes={administrativeTree} />
        </div>
      </section>

      <section className="card-section">
        <h2>Comités con detalle y actas</h2>
        <CommitteeExplorer committees={committees} onDownloadActa={handleActaDownload} />
      </section>

      <section className="sections-grid">
        <div className="card-section">
          <h2>Actas de comités</h2>
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

function LoadingScreen() {
  return (
    <div className="centered-state">
      <StatusBanner message="Validando sesión…" />
    </div>
  )
}

function NoAccessScreen({ message, logout, assignment }) {
  const roleLabel = assignment?.role != null ? ROLE_LABELS[assignment.role] || `Rol ${assignment.role}` : 'Rol sin asignación'

  return (
    <div className="auth-screen auth-screen--gradient">
      <div className="auth-card auth-card--compact">
        <img src={logo} alt="R21" className="auth-card__logo" />
        <h2>Acceso restringido</h2>
        <p className="auth-card__subtitle">
          Tu cuenta está autenticada, pero no cuenta con los privilegios necesarios para visualizar este panel estratégico.
        </p>
        <StatusBanner type="error" message={message || 'Solicita a tu coordinación una asignación de rol con privilegios.'} />
        <div className="auth-card__meta">
          <span><strong>Rol detectado:</strong> {roleLabel}</span>
        </div>
        <button type="button" className="secondary-button" onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

function App() {
  const { initializing, user, hasDashboardAccess, loginError, logout, assignment } = useAuth()

  if (initializing) {
    return <LoadingScreen />
  }

  if (!user) {
    return <LoginScreen />
  }

  if (!hasDashboardAccess) {
    return <NoAccessScreen message={loginError} logout={logout} assignment={assignment} />
  }

  return <DashboardContent />
}

export default App
