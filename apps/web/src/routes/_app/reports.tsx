import { createFileRoute } from '@tanstack/react-router'
import { ReportsScreen } from '../../features/reports/ReportsScreen'
import { sessionStore } from '../../lib/auth/session'
import { listReports, type GeneratedReport } from '../../lib/api/reports'

export interface ReportsData {
  reports: GeneratedReport[]
}

export const Route = createFileRoute('/_app/reports')({
  loader: async (): Promise<ReportsData> => {
    const token = sessionStore.getAccessToken()
    if (!token) return { reports: [] }
    return { reports: await listReports(token) }
  },
  component: ReportsScreen,
})
