import { useState } from 'react'
import { ApiError } from '../../lib/api/client'
import { Modal } from '../../components/ui/Modal'
import { Icon } from '../../components/ui/Icon'

interface AddCategoryModalProps {
  onClose: () => void
  onSubmit: (name: string) => Promise<void>
}

export function AddCategoryModal({ onClose, onSubmit }: AddCategoryModalProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setError(null)
    setSubmitting(true)
    try {
      await onSubmit(name)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не вдалося додати категорію')
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title="Нова категорія"
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
            <Icon name="plus" size={15} />
            {submitting ? 'Додавання…' : 'Додати'}
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
        <label>Назва категорії</label>
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="напр. БПЛА"
        />
      </div>
    </Modal>
  )
}
