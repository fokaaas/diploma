import { createFileRoute } from '@tanstack/react-router'
import { AcceptInvitationScreen } from '../features/auth/AcceptInvitationScreen'

interface InviteSearch {
  token: string
}

export const Route = createFileRoute('/invite')({
  validateSearch: (search: Record<string, unknown>): InviteSearch => ({
    token: typeof search.token === 'string' ? search.token : '',
  }),
  component: InviteRoute,
})

function InviteRoute() {
  const { token } = Route.useSearch()
  return <AcceptInvitationScreen token={token} />
}
