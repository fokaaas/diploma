import { createFileRoute } from '@tanstack/react-router'
import { CounterpartyCard } from '../../../features/counterparties/CounterpartyCard'
import { sessionStore } from '../../../lib/auth/session'
import {
  getCounterparty,
  type CounterpartyDetail,
} from '../../../lib/api/counterparties'

export interface CounterpartyDetailData {
  detail: CounterpartyDetail
}

export const Route = createFileRoute('/_app/counterparties/$counterpartyId')({
  loader: ({ params }): Promise<CounterpartyDetailData> => {
    const token = sessionStore.getAccessToken() ?? ''
    return getCounterparty(token, params.counterpartyId).then((detail) => ({
      detail,
    }))
  },
  component: CounterpartyCardRoute,
})

function CounterpartyCardRoute() {
  const { detail } = Route.useLoaderData()
  return <CounterpartyCard detail={detail} />
}
