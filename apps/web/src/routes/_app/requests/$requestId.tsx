import { createFileRoute } from '@tanstack/react-router'
import { RequestCard } from '../../../features/requests/RequestCard'

export const Route = createFileRoute('/_app/requests/$requestId')({
  component: RequestCardRoute,
})

function RequestCardRoute() {
  const { requestId } = Route.useParams()
  return <RequestCard id={requestId} />
}
