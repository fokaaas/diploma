import { createFileRoute } from '@tanstack/react-router'
import { ContributionCreate } from '../../../features/contributions/ContributionCreate'
import { sessionStore } from '../../../lib/auth/session'
import { listCounterparties } from '../../../lib/api/counterparties'
import type { DonorOption } from '../../../features/contributions/ContributionForm'

export interface ContributionFormData {
  donors: DonorOption[]
}

export const Route = createFileRoute('/_app/contributions/new')({
  loader: async (): Promise<ContributionFormData> => {
    const token = sessionStore.getAccessToken()
    if (!token) return { donors: [] }
    const counterparties = await listCounterparties(token)
    return {
      donors: counterparties
        .filter((c) => c.type === 'donor')
        .map((c) => ({ id: c.id, name: c.name })),
    }
  },
  component: ContributionCreate,
})
