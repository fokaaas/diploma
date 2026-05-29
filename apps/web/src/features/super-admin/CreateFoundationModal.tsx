import { useState } from 'react'
import type { CreateFoundationInput } from '../../lib/api/platform'
import { ApiError } from '../../lib/api/client'
import { Modal } from '../../components/ui/Modal'
import { Icon } from '../../components/ui/Icon'

interface CreateFoundationModalProps {
  onClose: () => void
  onSubmit: (input: CreateFoundationInput) => Promise<void>
}

export function CreateFoundationModal({ onClose, onSubmit }: CreateFoundationModalProps) {
  const [legalName, setLegalName] = useState('')
  const [shortName, setShortName] = useState('')
  const [edrpou, setEdrpou] = useState('')
  const [adminFullName, setAdminFullName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setError(null)
    setSubmitting(true)
    try {
      await onSubmit({ legalName, shortName, edrpou, adminFullName, adminEmail })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не вдалося створити фонд')
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title="Створення нового фонду-клієнта"
      onClose={onClose}
      size="lg"
      footer={
        <>
          <button className="btn" onClick={onClose}>
            Скасувати
          </button>
          <button className="btn btn--primary" onClick={() => void handleSubmit()} disabled={submitting}>
            <Icon name="send" size={15} />
            {submitting ? 'Створення…' : 'Створити та надіслати запрошення'}
          </button>
        </>
      }
    >
      <div className="note note--info mb-3">
        <Icon name="info" size={16} />
        <div>
          Після створення на email майбутнього адміністратора буде надіслано лист-запрошення.
          Обліковий запис створиться в статусі <strong>«Запрошений»</strong> до прийняття
          запрошення.
        </div>
      </div>
      {error && (
        <div className="note note--danger mb-3">
          <Icon name="alert" size={16} />
          <div>{error}</div>
        </div>
      )}
      <div className="form-row">
        <div className="field">
          <label>
            Повна назва фонду <span style={{ color: '#c2541e' }}>*</span>
          </label>
          <input
            className="input"
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
            placeholder="Благодійна організація «...»"
          />
        </div>
        <div className="field">
          <label>
            Скорочена назва <span style={{ color: '#c2541e' }}>*</span>
          </label>
          <input
            className="input"
            value={shortName}
            onChange={(e) => setShortName(e.target.value)}
            placeholder="Для шапки інтерфейсу"
          />
        </div>
      </div>
      <div className="form-row">
        <div className="field">
          <label>
            Код ЄДРПОУ <span style={{ color: '#c2541e' }}>*</span>
          </label>
          <input className="input" value={edrpou} onChange={(e) => setEdrpou(e.target.value)} />
        </div>
        <div className="field">
          <label>Країна</label>
          <select className="select">
            <option>Україна</option>
          </select>
        </div>
      </div>
      <div className="divider" />
      <h4 style={{ margin: '0 0 10px' }}>Перший адміністратор фонду</h4>
      <div className="form-row">
        <div className="field">
          <label>
            ПІБ <span style={{ color: '#c2541e' }}>*</span>
          </label>
          <input
            className="input"
            value={adminFullName}
            onChange={(e) => setAdminFullName(e.target.value)}
          />
        </div>
        <div className="field">
          <label>
            Email <span style={{ color: '#c2541e' }}>*</span>
          </label>
          <input
            className="input"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            placeholder="на цю адресу буде надіслано запрошення"
          />
        </div>
      </div>
    </Modal>
  )
}
