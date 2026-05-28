import { createFileRoute } from '@tanstack/react-router'
import { PublicReportPage } from '../features/public-report/PublicReportPage'

export const Route = createFileRoute('/public-report')({
  component: PublicReportPage,
})
