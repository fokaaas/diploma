import { createFileRoute } from '@tanstack/react-router'
import { ProcurementCard } from '../../../features/procurements/ProcurementCard'

export const Route = createFileRoute('/_app/procurements/$procurementId')({
  component: ProcurementCardRoute,
})

function ProcurementCardRoute() {
  const { procurementId } = Route.useParams()
  return <ProcurementCard id={procurementId} />
}
