import { createFileRoute } from '@tanstack/react-router'
import { RequestsList } from '../../../features/requests/RequestsList'
import { sessionStore } from '../../../lib/auth/session'
import { listRequests, type RequestListItem } from '../../../lib/api/requests'

export interface RequestsData {
  requests: RequestListItem[]
}

export const Route = createFileRoute('/_app/requests/')({
  loader: async (): Promise<RequestsData> => {
    const token = sessionStore.getAccessToken()
    if (!token) return { requests: [] }
    return { requests: await listRequests(token) }
  },
  component: RequestsList,
})
