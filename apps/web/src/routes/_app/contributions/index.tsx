import { createFileRoute } from '@tanstack/react-router'
import { ContributionsList } from '../../../features/contributions/ContributionsList'

export const Route = createFileRoute('/_app/contributions/')({
  component: ContributionsList,
})
