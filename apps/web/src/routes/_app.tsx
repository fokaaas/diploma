import { createFileRoute, Outlet, redirect, useLocation } from '@tanstack/react-router'
import { sessionStore, useAuth } from '../lib/auth/session'
import { canAccess } from '../lib/rbac'
import { getNavCounts, type NavCounts } from '../lib/api/nav'
import { AppShell } from '../components/layout/AppShell'
import { AccessDenied } from '../components/layout/AccessDenied'

export interface AppLayoutData {
  counts: NavCounts
}

export const Route = createFileRoute('/_app')({
  beforeLoad: () => {
    if (!sessionStore.isAuthenticated()) {
      throw redirect({ to: '/login' })
    }
  },
  loader: async (): Promise<AppLayoutData> => {
    const token = sessionStore.getAccessToken()
    if (!token) return { counts: { requests: 0, procurements: 0 } }
    return { counts: await getNavCounts(token) }
  },
  component: AppLayout,
})

function AppLayout() {
  const { role } = useAuth()
  const pathname = useLocation({ select: (location) => location.pathname })
  const denied = role !== null && !canAccess(role, pathname)

  return <AppShell>{denied ? <AccessDenied /> : <Outlet />}</AppShell>
}
