import { createFileRoute, Outlet, redirect, useLocation } from '@tanstack/react-router'
import { sessionStore, useAuth } from '../lib/auth/session'
import { canAccess } from '../lib/rbac'
import { AppShell } from '../components/layout/AppShell'
import { AccessDenied } from '../components/layout/AccessDenied'

export const Route = createFileRoute('/_app')({
  beforeLoad: () => {
    if (!sessionStore.isAuthenticated()) {
      throw redirect({ to: '/login' })
    }
  },
  component: AppLayout,
})

function AppLayout() {
  const { role } = useAuth()
  const pathname = useLocation({ select: (location) => location.pathname })
  const denied = role !== null && !canAccess(role, pathname)

  return <AppShell>{denied ? <AccessDenied /> : <Outlet />}</AppShell>
}
