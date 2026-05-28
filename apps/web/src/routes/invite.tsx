import { createFileRoute } from '@tanstack/react-router'
import { AcceptInvitationScreen } from '../features/auth/AcceptInvitationScreen'

interface InviteSearch {
  status: 'new' | 'expired'
}

export const Route = createFileRoute('/invite')({
  validateSearch: (search: Record<string, unknown>): InviteSearch => ({
    status: search.status === 'expired' ? 'expired' : 'new',
  }),
  component: InviteRoute,
})

function InviteRoute() {
  const { status } = Route.useSearch()
  return <AcceptInvitationScreen status={status} />
}
