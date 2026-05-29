import { createFileRoute } from '@tanstack/react-router'
import { CounterpartiesList } from '../../../features/counterparties/CounterpartiesList'
import { sessionStore } from '../../../lib/auth/session'
import {
  listCounterparties,
  type Counterparty,
} from '../../../lib/api/counterparties'

export interface CounterpartiesData {
  counterparties: Counterparty[]
}

export const Route = createFileRoute('/_app/counterparties/')({
  loader: async (): Promise<CounterpartiesData> => {
    const token = sessionStore.getAccessToken()
    if (!token) return { counterparties: [] }
    return { counterparties: await listCounterparties(token) }
  },
  component: CounterpartiesList,
})
