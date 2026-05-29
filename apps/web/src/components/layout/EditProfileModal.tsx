import { useState } from 'react'
import type { User } from '../../types/domain'
import { updateProfile } from '../../lib/api/auth'
import { sessionStore } from '../../lib/auth/session'
import { ApiError } from '../../lib/api/client'
import { useToast } from '../../context/toast-context'
import { Modal } from '../ui/Modal'
import { Icon } from '../ui/Icon'

export function EditProfileModal({ user, onClose }: { user: User; onClose: () => void }) {
  const { showToast } = useToast()
  const [fullName, setFullName] = useState(user.name)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (fullName.trim() === '') {
      setError('Вкажіть ПІБ')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const token = sessionStore.getAccessToken() ?? ''
      const saved = await updateProfile(token, fullName.trim())
      sessionStore.setUserName(saved)
      showToast('Профіль оновлено')
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не вдалося зберегти профіль')
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title="Редагувати профіль"
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
        <label>ПІБ</label>
        <input
          className="input"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoFocus
        />
      </div>
      <div className="field">
        <label>Email</label>
        <input className="input" value={user.email} disabled />
        <div className="muted text-xs mt-1">Email — це логін, його не можна змінити</div>
      </div>
    </Modal>
  )
}
