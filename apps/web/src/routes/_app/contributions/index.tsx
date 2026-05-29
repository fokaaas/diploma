import { createFileRoute } from '@tanstack/react-router'
import { ContributionsList } from '../../../features/contributions/ContributionsList'
import { sessionStore } from '../../../lib/auth/session'
import {
  listContributions,
  type ContributionListItem,
} from '../../../lib/api/contributions'

export interface ContributionsData {
  contributions: ContributionListItem[]
}

export const Route = createFileRoute('/_app/contributions/')({
  loader: async (): Promise<ContributionsData> => {
    const token = sessionStore.getAccessToken()
    if (!token) return { contributions: [] }
    return { contributions: await listContributions(token) }
  },
  component: ContributionsList,
})
