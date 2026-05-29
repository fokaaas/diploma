import { createFileRoute } from '@tanstack/react-router'
import { PublicReportPage } from '../features/public-report/PublicReportPage'
import { getPublicReport, type PublicReport } from '../lib/api/reports'

interface PublicReportSearch {
  slug?: string
}

export interface PublicReportData {
  report: PublicReport | null
}

export const Route = createFileRoute('/public-report')({
  validateSearch: (search: Record<string, unknown>): PublicReportSearch => ({
    slug: typeof search.slug === 'string' ? search.slug : undefined,
  }),
  loaderDeps: ({ search }) => ({ slug: search.slug }),
  loader: async ({ deps }): Promise<PublicReportData> => {
    if (!deps.slug) return { report: null }
    try {
      return { report: await getPublicReport(deps.slug) }
    } catch {
      return { report: null }
    }
  },
  component: PublicReportRoute,
})

function PublicReportRoute() {
  const { report } = Route.useLoaderData()
  return <PublicReportPage report={report} />
}
