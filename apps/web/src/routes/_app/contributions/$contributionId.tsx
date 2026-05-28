import { createFileRoute } from '@tanstack/react-router'
import { ContributionCard } from '../../../features/contributions/ContributionCard'

export const Route = createFileRoute('/_app/contributions/$contributionId')({
  component: ContributionCardRoute,
})

function ContributionCardRoute() {
  const { contributionId } = Route.useParams()
  return <ContributionCard id={contributionId} />
}
