import axios from 'axios'

const isLocalhost = typeof window !== 'undefined' && ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)
const resolvedBase = isLocalhost ? 'http://localhost:8000' : import.meta.env.VITE_API_BASE
const baseURL = (resolvedBase || 'http://localhost:8000').replace(/\/$/, '')

export const api = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('token')
    if (token) {
      config.headers = config.headers ?? {}
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== 'undefined') {
      window.localStorage.removeItem('token')
    }
    return Promise.reject(error)
  },
)

const unwrap = (response) => response.data

export const fetchAttendance = () => api.get('dashboard/attendance').then(unwrap)
export const fetchCommitteeStats = () => api.get('dashboard/committee-stats').then(unwrap)
export const fetchAdministrativeTree = () => api.get('dashboard/administrative-tree').then(unwrap)
export const fetchMunicipalStats = () => api.get('dashboard/municipal-stats').then(unwrap)
export const fetchAdministrativeTreeFull = () => api.get('dashboard/administrative-tree?prune_empty=false').then(unwrap)
export const fetchUserAssignments = () => api.get('dashboard/user-assignments').then(unwrap)
export const fetchCommittees = () => api.get('dashboard/committees').then(unwrap)
export const fetchDocuments = () => api.get('dashboard/documents').then(unwrap)
export const fetchMetrics = () => api.get('dashboard/metrics').then(unwrap)
export const fetchAttendanceMap = () => api.get('dashboard/attendance/map').then(unwrap)
export const googleLoginRequest = (idToken) => api.post('auth/google', { id_token: idToken }).then(unwrap)
export const usernamePasswordLoginRequest = (username, password) => api.post('auth/login', { username, password }).then(unwrap)
export const fetchCurrentUser = () => api.get('auth/me').then(unwrap)
export const fetchMyAssignment = () => api.get('auth/me/assignment').then(unwrap)

export const downloadCommitteesExcel = () =>
  api.get('dashboard/exports/committees.xlsx', { responseType: 'blob' })

export const downloadCommitteeActa = (committeeId) =>
  api.get(`dashboard/committees/${committeeId}/acta.pdf`, { responseType: 'blob' })

export const fetchCommitteeDocuments = (committeeId) =>
  api.get(`committees/${committeeId}/documents`).then(unwrap)

export const getUploadUrl = (filename) => `${baseURL}/api/uploads/${filename}`
