import type { IconName } from '../components/ui/Icon'
import type { Role } from '../types/domain'

export type AppSectionRoute =
  | '/'
  | '/requests'
  | '/counterparties'
  | '/contributions'
  | '/procurements'
  | '/warehouse'
  | '/reports'
  | '/audit'
  | '/admin'

export interface NavItem {
  key: string
  label: string
  icon: IconName
  path: AppSectionRoute
  roles: Role[]
  count?: number
}

export const NAV: NavItem[] = [
  { key: 'dashboard', label: 'Дашборд', icon: 'dashboard', path: '/', roles: ['admin', 'coordinator', 'accountant', 'auditor'] },
  { key: 'requests', label: 'Заявки', icon: 'requests', path: '/requests', roles: ['admin', 'coordinator', 'auditor'], count: 24 },
  { key: 'counterparties', label: 'Контрагенти', icon: 'counterparties', path: '/counterparties', roles: ['admin', 'coordinator', 'accountant', 'auditor'] },
  { key: 'contributions', label: 'Благодійні внески', icon: 'contributions', path: '/contributions', roles: ['admin', 'accountant', 'auditor'] },
  { key: 'procurements', label: 'Закупівлі', icon: 'procurements', path: '/procurements', roles: ['admin', 'coordinator', 'accountant', 'auditor'], count: 8 },
  { key: 'warehouse', label: 'Склад', icon: 'warehouse', path: '/warehouse', roles: ['admin', 'coordinator', 'auditor'] },
  { key: 'reports', label: 'Звітність', icon: 'reports', path: '/reports', roles: ['admin', 'accountant', 'auditor'] },
  { key: 'audit', label: 'Аудит та історія', icon: 'audit', path: '/audit', roles: ['admin', 'auditor'] },
  { key: 'admin', label: 'Адміністрування', icon: 'admin', path: '/admin', roles: ['admin'] },
]

/** Resolve which navigation section a pathname belongs to. */
export function sectionForPath(pathname: string): NavItem | undefined {
  if (pathname === '/') return NAV[0]
  return NAV.filter((item) => item.path !== '/').find(
    (item) => pathname === item.path || pathname.startsWith(`${item.path}/`),
  )
}

export function canAccess(role: Role, pathname: string): boolean {
  const section = sectionForPath(pathname)
  if (!section) return true
  return section.roles.includes(role)
}
