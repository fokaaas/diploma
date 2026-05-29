import type { User } from '../../types/domain'
import { useToast } from '../../context/toast-context'
import { Icon } from '../ui/Icon'

interface TopBarProps {
  user: User
  roleLabel: string
  foundationName: string
  onProfileClick: () => void
}

export function TopBar({ user, roleLabel, foundationName, onProfileClick }: TopBarProps) {
  const { showToast } = useToast()
  return (
    <header className="topbar">
      <div className="topbar__brand muted" style={{ fontSize: 'var(--fs-sm)' }}>
        <Icon name="shield" size={14} color="var(--olive-500)" />
        <span>{foundationName}</span>
      </div>
      <div className="topbar__search">
        <Icon name="search" size={15} />
        <input placeholder="Пошук по заявках, контрагентах, документах..." />
        <span className="mono text-xs faint">⌘K</span>
      </div>
      <div className="topbar__right">
        <button
          className="topbar__icon-btn"
          title="Допомога"
          onClick={() => showToast('Довідковий центр незабаром')}
        >
          <Icon name="help" size={17} />
        </button>
        <button
          className="topbar__icon-btn"
          title="Сповіщення"
          onClick={() => showToast('Немає нових сповіщень')}
        >
          <Icon name="bell" size={17} />
          <span className="dot" />
        </button>
        <button className="user-chip" onClick={onProfileClick}>
          <span className="user-chip__avatar">{user.initials}</span>
          <span>
            <div className="user-chip__name">{user.name}</div>
            <div className="user-chip__role">{roleLabel}</div>
          </span>
          <Icon name="chevron-down" size={14} />
        </button>
      </div>
    </header>
  )
}
