import { createFileRoute } from '@tanstack/react-router'
import { ContributionEdit } from '../../../features/contributions/ContributionEdit'
import { sessionStore } from '../../../lib/auth/session'
import {
  getContribution,
  type ContributionDetail,
} from '../../../lib/api/contributions'
import { listCounterparties } from '../../../lib/api/counterparties'
import type { DonorOption } from '../../../features/contributions/ContributionForm'

export interface ContributionEditData {
  detail: ContributionDetail
  donors: DonorOption[]
}

export const Route = createFileRoute('/_app/contributions/$contributionId/edit')({
  loader: async ({ params }): Promise<ContributionEditData> => {
    const token = sessionStore.getAccessToken() ?? ''
    const [detail, counterparties] = await Promise.all([
      getContribution(token, params.contributionId),
      listCounterparties(token),
    ])
    return {
      detail,
      donors: counterparties
        .filter((c) => c.type === 'donor')
        .map((c) => ({ id: c.id, name: c.name })),
    }
  },
  component: ContributionEdit,
})
