import { createFileRoute } from '@tanstack/react-router'
import { CounterpartyCard } from '../../../features/counterparties/CounterpartyCard'

export const Route = createFileRoute('/_app/counterparties/$counterpartyId')({
  component: CounterpartyCardRoute,
})

function CounterpartyCardRoute() {
  const { counterpartyId } = Route.useParams()
  return <CounterpartyCard id={counterpartyId} />
}
