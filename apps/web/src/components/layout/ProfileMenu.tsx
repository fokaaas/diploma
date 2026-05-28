import type { User } from '../../types/domain'
import { useToast } from '../../context/toast-context'
import { Avatar } from '../ui/Avatar'
import { Icon } from '../ui/Icon'

interface ProfileMenuProps {
  user: User
  roleLabel: string
  onClose: () => void
  onLogout: () => void
}

export function ProfileMenu({ user, roleLabel, onClose, onLogout }: ProfileMenuProps) {
  const { showToast } = useToast()
  return (
    <div className="modal-backdrop" onClick={onClose} style={{ background: 'rgba(28,32,20,0.18)' }}>
      <div className="modal" style={{ maxWidth: 360 }} onClick={(event) => event.stopPropagation()}>
        <div className="modal__header">
          <h3 className="modal__title">Профіль користувача</h3>
          <button className="modal__close" onClick={onClose} aria-label="Закрити">
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="modal__body">
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
            <Avatar initials={user.initials} size="lg" color="var(--olive-600)" />
            <div>
              <div style={{ fontWeight: 600 }}>{user.name}</div>
              <div className="muted text-sm">{user.email}</div>
              <span className="badge badge--plain mt-2" style={{ display: 'inline-flex' }}>
                {roleLabel}
              </span>
            </div>
          </div>
          <div className="divider" />
          <button
            className="btn w-full mb-2"
            style={{ justifyContent: 'flex-start' }}
            onClick={() => {
              onClose()
              showToast('Редагування профілю незабаром')
            }}
          >
            <Icon name="user" size={16} />
            Редагувати профіль
          </button>
          <button
            className="btn w-full mb-2"
            style={{ justifyContent: 'flex-start' }}
            onClick={() => {
              onClose()
              showToast('Зміна пароля незабаром')
            }}
          >
            <Icon name="lock" size={16} />
            Змінити пароль
          </button>
          <button
            className="btn w-full btn--danger"
            style={{ justifyContent: 'flex-start' }}
            onClick={onLogout}
          >
            <Icon name="logout" size={16} />
            Вийти
          </button>
        </div>
      </div>
    </div>
  )
}
