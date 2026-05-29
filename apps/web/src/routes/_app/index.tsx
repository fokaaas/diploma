import { createFileRoute } from '@tanstack/react-router'
import { DashboardScreen } from '../../features/dashboard/DashboardScreen'
import { sessionStore } from '../../lib/auth/session'
import { getDashboard, type DashboardOverview } from '../../lib/api/dashboard'

interface DashboardSearch {
  month: string
}

export interface DashboardData {
  overview: DashboardOverview | null
}

function currentMonth(): string {
  const now = new Date()
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
}

export const Route = createFileRoute('/_app/')({
  validateSearch: (search: Record<string, unknown>): DashboardSearch => ({
    month:
      typeof search.month === 'string' && /^\d{4}-\d{2}$/.test(search.month)
        ? search.month
        : currentMonth(),
  }),
  loaderDeps: ({ search }) => ({ month: search.month }),
  loader: async ({ deps }): Promise<DashboardData> => {
    const token = sessionStore.getAccessToken()
    if (!token) return { overview: null }
    return { overview: await getDashboard(token, deps.month) }
  },
  component: DashboardRoute,
})

function DashboardRoute() {
  const { month } = Route.useSearch()
  return <DashboardScreen month={month} />
}
