import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import {
  fetchAttendance,
  fetchCommitteeStats,
  fetchAdministrativeTree,
  fetchUserAssignments,
  fetchCommittees,
  fetchDocuments,
  fetchMetrics,
  fetchAttendanceMap,
} from '../api/client'

const sanitizePresidents = (committees = []) =>
  committees
    .filter((committee) => committee.presidente?.trim() && committee.telefono?.trim())
    .map((committee) => ({
      id: committee.id,
      name: committee.presidente,
      phone: committee.telefono,
      email: committee.email,
      committeeName: committee.name,
      section: committee.section_number,
    }))

export const useDashboardData = (enabled = true) => {
  const queryResults = useQueries({
    queries: [
      { queryKey: ['attendance'], queryFn: fetchAttendance, staleTime: 1000 * 60, enabled },
      { queryKey: ['committee-stats'], queryFn: fetchCommitteeStats, staleTime: 1000 * 120, enabled },
      { queryKey: ['administrative-tree'], queryFn: fetchAdministrativeTree, staleTime: 1000 * 300, enabled },
      { queryKey: ['assignments'], queryFn: fetchUserAssignments, staleTime: 1000 * 180, enabled },
      { queryKey: ['committees'], queryFn: fetchCommittees, staleTime: 1000 * 90, enabled },
      { queryKey: ['documents'], queryFn: fetchDocuments, staleTime: 1000 * 90, enabled },
      { queryKey: ['metrics'], queryFn: fetchMetrics, staleTime: 1000 * 60, enabled },
      { queryKey: ['attendance-map'], queryFn: fetchAttendanceMap, staleTime: 1000 * 60, enabled },
    ],
  })

  const [
    attendanceQuery,
    statsQuery,
    treeQuery,
    assignmentsQuery,
    committeesQuery,
    documentsQuery,
    metricsQuery,
    mapQuery,
  ] = queryResults

  const loading = queryResults.some((query) => query.isLoading)
  const error = queryResults.find((query) => query.error)?.error ?? null

  const presidents = useMemo(
    () => sanitizePresidents(committeesQuery.data),
    [committeesQuery.data],
  )

  const data = {
    attendance: attendanceQuery.data ?? [],
    stats: statsQuery.data ?? { by_user: [], by_section: [], by_municipality: [], by_type: [] },
    administrativeTree: treeQuery.data ?? [],
    assignments: assignmentsQuery.data ?? [],
    committees: committeesQuery.data ?? [],
    documents: documentsQuery.data ?? [],
    metrics: metricsQuery.data ?? null,
    mapPoints: mapQuery.data ?? [],
    presidents,
  }

  const refetchAll = () => Promise.all(queryResults.map((query) => query.refetch()))

  return {
    ...data,
    loading,
    error,
    refetchAll,
  }
}
