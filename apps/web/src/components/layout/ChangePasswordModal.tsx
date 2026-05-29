import { useState } from 'react'
import { changePassword } from '../../lib/api/auth'
import { sessionStore } from '../../lib/auth/session'
import { ApiError } from '../../lib/api/client'
import { useToast } from '../../context/toast-context'
import { Modal } from '../ui/Modal'
import { Icon } from '../ui/Icon'

export function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const { showToast } = useToast()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (current === '') {
      setError('Введіть поточний пароль')
      return
    }
    if (next.length < 10) {
      setError('Новий пароль повинен містити щонайменше 10 символів')
      return
    }
    if (next !== confirm) {
      setError('Паролі не збігаються')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const token = sessionStore.getAccessToken() ?? ''
      await changePassword(token, current, next)
      showToast('Пароль змінено')
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не вдалося змінити пароль')
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title="Змінити пароль"
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
        <label>Поточний пароль</label>
        <input
          className="input"
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          autoFocus
        />
      </div>
      <div className="field">
        <label>Новий пароль</label>
        <input
          className="input"
          type="password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
        />
        <div className="muted text-xs mt-1">Щонайменше 10 символів, із цифрою та літерою</div>
      </div>
      <div className="field">
        <label>Підтвердження нового пароля</label>
        <input
          className="input"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>
    </Modal>
  )
}
