import { Link, useRouterState } from '@tanstack/react-router'
import type { Role } from '../../types/domain'
import { NAV, sectionForPath } from '../../lib/rbac'
import { initialsOf } from '../../lib/initials'
import { Icon } from '../ui/Icon'

interface SidebarProps {
  role: Role
  foundationName: string
}

export function Sidebar({ role, foundationName }: SidebarProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const activeKey = sectionForPath(pathname)?.key
  const items = NAV.filter((item) => item.roles.includes(role))
  const mark = initialsOf(foundationName).slice(0, 2).toUpperCase()

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <span className="sidebar__logo-mark">{mark}</span>
        <span>{foundationName}</span>
      </div>
      <div className="sidebar__section-label">Робочий простір</div>
      {items.map((item) => {
        const active = activeKey === item.key
        return (
          <Link
            key={item.key}
            to={item.path}
            className={`sidebar__item ${active ? 'sidebar__item--active' : ''}`}
          >
            <span className="sidebar__item-icon">
              <Icon name={item.icon} size={17} />
            </span>
            <span>{item.label}</span>
            {item.count && !active && <span className="sidebar__item-count">{item.count}</span>}
          </Link>
        )
      })}
    </aside>
  )
}
