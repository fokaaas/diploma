import { createFileRoute, redirect } from '@tanstack/react-router'
import { platformSessionStore } from '../lib/auth/platform-session'
import { listFoundations, type FoundationSummary } from '../lib/api/platform'
import { SuperAdminScreen } from '../features/super-admin/SuperAdminScreen'

export const Route = createFileRoute('/super-admin')({
  beforeLoad: () => {
    if (!platformSessionStore.isAuthenticated()) {
      throw redirect({ to: '/platform-login' })
    }
  },
  loader: (): Promise<FoundationSummary[]> => {
    const token = platformSessionStore.getAccessToken()
    return token ? listFoundations(token) : Promise.resolve([])
  },
  component: SuperAdminScreen,
})
