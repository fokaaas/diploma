import { useState } from 'react'
import type { Role } from '../../types/domain'
import type { InviteUserInput } from '../../lib/api/users'
import { ApiError } from '../../lib/api/client'
import { ROLE_LABELS } from '../../data/users'
import { Modal } from '../../components/ui/Modal'
import { Icon } from '../../components/ui/Icon'

const ROLES: Role[] = ['coordinator', 'accountant', 'auditor', 'admin']

interface InviteUserModalProps {
  onClose: () => void
  onSubmit: (input: InviteUserInput) => Promise<void>
}

export function InviteUserModal({ onClose, onSubmit }: InviteUserModalProps) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('coordinator')
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setError(null)
    setSubmitting(true)
    try {
      await onSubmit({ fullName, email, role, message: message || undefined })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не вдалося надіслати запрошення')
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title="Запрошення нового користувача"
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
            <Icon name="send" size={15} />
            {submitting ? 'Надсилання…' : 'Надіслати запрошення'}
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
      <div className="form-row">
        <div className="field">
          <label>Імʼя та прізвище</label>
          <input
            className="input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="ПІБ"
          />
        </div>
        <div className="field">
          <label>Email</label>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ім'я@приклад.com"
          />
        </div>
      </div>
      <div className="field">
        <label>Роль</label>
        <select className="select" value={role} onChange={(e) => setRole(e.target.value as Role)}>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
        <div className="field__hint">Користувач отримає лист із посиланням для встановлення пароля.</div>
      </div>
      <div className="field">
        <label>Особисте повідомлення (необов'язково)</label>
        <textarea
          className="textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Кілька слів для майбутнього колеги..."
        />
      </div>
      <div className="note note--info">
        <Icon name="info" size={16} />
        <div>
          Посилання діятиме <strong>72 години</strong>. Після прийняття запрошення обліковий запис
          автоматично активується.
        </div>
      </div>
    </Modal>
  )
}
