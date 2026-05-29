import { createFileRoute } from '@tanstack/react-router'
import { ContributionCard } from '../../../features/contributions/ContributionCard'
import { sessionStore } from '../../../lib/auth/session'
import {
  getContribution,
  type ContributionDetail,
} from '../../../lib/api/contributions'

export interface ContributionDetailData {
  detail: ContributionDetail
}

export const Route = createFileRoute('/_app/contributions/$contributionId')({
  loader: ({ params }): Promise<ContributionDetailData> => {
    const token = sessionStore.getAccessToken() ?? ''
    return getContribution(token, params.contributionId).then((detail) => ({
      detail,
    }))
  },
  component: ContributionCardRoute,
})

function ContributionCardRoute() {
  const { detail } = Route.useLoaderData()
  return <ContributionCard detail={detail} />
}
