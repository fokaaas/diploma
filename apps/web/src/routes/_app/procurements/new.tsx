import { createFileRoute } from '@tanstack/react-router'
import { ProcurementCreate } from '../../../features/procurements/ProcurementCreate'
import { sessionStore } from '../../../lib/auth/session'
import { listCounterparties } from '../../../lib/api/counterparties'
import { listRequests } from '../../../lib/api/requests'
import { listContributions } from '../../../lib/api/contributions'
import type {
  ContributionOption,
  RequestOption,
  SupplierOption,
} from '../../../features/procurements/ProcurementForm'

export interface ProcurementFormData {
  suppliers: SupplierOption[]
  requests: RequestOption[]
  contributions: ContributionOption[]
}

export async function loadFormData(token: string): Promise<ProcurementFormData> {
  const [counterparties, requests, contributions] = await Promise.all([
    listCounterparties(token),
    listRequests(token),
    listContributions(token),
  ])
  return {
    suppliers: counterparties
      .filter((c) => c.type === 'supplier')
      .map((c) => ({ id: c.id, name: c.name })),
    requests: requests.map((r) => ({
      id: r.id,
      number: r.number,
      unitName: r.unitName,
    })),
    contributions: contributions.map((c) => ({
      id: c.id,
      number: c.number,
      donorName: c.donorName,
      unspent: Math.max(0, c.amount - c.allocatedTotal),
    })),
  }
}

export const Route = createFileRoute('/_app/procurements/new')({
  loader: async (): Promise<ProcurementFormData> => {
    const token = sessionStore.getAccessToken()
    if (!token) return { suppliers: [], requests: [], contributions: [] }
    return loadFormData(token)
  },
  component: ProcurementCreate,
})
