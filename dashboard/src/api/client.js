import axios from 'axios'

const defaultBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const baseURL = defaultBaseUrl.replace(/\/$/, '')

export const api = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
  },
})

const unwrap = (response) => response.data

export const fetchAttendance = () => api.get('/dashboard/attendance').then(unwrap)
export const fetchCommitteeStats = () => api.get('/dashboard/committee-stats').then(unwrap)
export const fetchAdministrativeTree = () => api.get('/dashboard/administrative-tree').then(unwrap)
export const fetchUserAssignments = () => api.get('/dashboard/user-assignments').then(unwrap)
export const fetchCommittees = () => api.get('/dashboard/committees').then(unwrap)
export const fetchDocuments = () => api.get('/dashboard/documents').then(unwrap)
export const fetchMetrics = () => api.get('/dashboard/metrics').then(unwrap)
export const fetchAttendanceMap = () => api.get('/dashboard/attendance/map').then(unwrap)

export const getExportUrls = () => ({
  committeesExcel: `${baseURL}/dashboard/exports/committees.xlsx`,
  committeeActa: (committeeId) => `${baseURL}/dashboard/committees/${committeeId}/acta.pdf`,
})
