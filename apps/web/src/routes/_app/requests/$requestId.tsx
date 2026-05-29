import { createFileRoute } from '@tanstack/react-router'
import { RequestCard } from '../../../features/requests/RequestCard'
import { sessionStore } from '../../../lib/auth/session'
import { getRequest, type RequestDetail } from '../../../lib/api/requests'

export interface RequestDetailData {
  detail: RequestDetail
}

export const Route = createFileRoute('/_app/requests/$requestId')({
  loader: ({ params }): Promise<RequestDetailData> => {
    const token = sessionStore.getAccessToken() ?? ''
    return getRequest(token, params.requestId).then((detail) => ({ detail }))
  },
  component: RequestCardRoute,
})

function RequestCardRoute() {
  const { detail } = Route.useLoaderData()
  return <RequestCard detail={detail} />
}
