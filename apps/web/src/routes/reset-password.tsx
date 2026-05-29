import { createFileRoute } from '@tanstack/react-router'
import { ResetPasswordScreen } from '../features/auth/ResetPasswordScreen'

interface ResetSearch {
  token: string
}

export const Route = createFileRoute('/reset-password')({
  validateSearch: (search: Record<string, unknown>): ResetSearch => ({
    token: typeof search.token === 'string' ? search.token : '',
  }),
  component: ResetPasswordRoute,
})

function ResetPasswordRoute() {
  const { token } = Route.useSearch()
  return <ResetPasswordScreen token={token} />
}
