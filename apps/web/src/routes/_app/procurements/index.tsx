import { createFileRoute } from '@tanstack/react-router'
import { ProcurementsList } from '../../../features/procurements/ProcurementsList'

export const Route = createFileRoute('/_app/procurements/')({
  component: ProcurementsList,
})
