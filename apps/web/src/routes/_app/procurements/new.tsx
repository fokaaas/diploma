import { createFileRoute } from '@tanstack/react-router'
import { ProcurementCreate } from '../../../features/procurements/ProcurementCreate'

export const Route = createFileRoute('/_app/procurements/new')({
  component: ProcurementCreate,
})
