import { useState } from 'react'
import type { Role } from '../../types/domain'
import type { AdminUser } from '../../lib/api/users'
import { ApiError } from '../../lib/api/client'
import { ROLE_LABELS } from '../../data/users'
import { Modal } from '../../components/ui/Modal'
import { Icon } from '../../components/ui/Icon'

const ROLES: Role[] = ['coordinator', 'accountant', 'auditor', 'admin']

interface ChangeRoleModalProps {
  user: AdminUser
  onClose: () => void
  onSubmit: (role: Role) => Promise<void>
}

export function ChangeRoleModal({ user, onClose, onSubmit }: ChangeRoleModalProps) {
  const [role, setRole] = useState<Role>(user.role)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setError(null)
    setSubmitting(true)
    try {
      await onSubmit(role)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не вдалося змінити роль')
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title={`Роль користувача · ${user.fullName}`}
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>
            Скасувати
          </button>
          <button
            className="btn btn--primary"
            onClick={() => void handleSubmit()}
            disabled={submitting}
          >
            <Icon name="check" size={15} />
            {submitting ? 'Збереження…' : 'Зберегти'}
          </button>
        </>
      }
    >
      {error && (
        <div className="note note--danger mb-3">
          <Icon name="alert" size={16} />
          <div>{error}</div>
        </div>
      )}
      <div className="field">
        <label>Роль</label>
        <select className="select" value={role} onChange={(e) => setRole(e.target.value as Role)}>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
      </div>
    </Modal>
  )
}
