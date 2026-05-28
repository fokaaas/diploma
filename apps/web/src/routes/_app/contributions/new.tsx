import { createFileRoute } from '@tanstack/react-router'
import { ContributionCreate } from '../../../features/contributions/ContributionCreate'

export const Route = createFileRoute('/_app/contributions/new')({
  component: ContributionCreate,
})
