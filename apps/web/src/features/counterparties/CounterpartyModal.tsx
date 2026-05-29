import { useState } from 'react'
import type { CounterpartyType } from '../../types/domain'
import {
  CHANNEL_OPTIONS,
  LEGAL_FORM_OPTIONS,
  TYPE_OPTIONS,
  type Channel,
  type Counterparty,
  type CounterpartyInput,
  type LegalForm,
} from '../../lib/api/counterparties'
import { ApiError } from '../../lib/api/client'
import { Modal } from '../../components/ui/Modal'
import { Icon } from '../../components/ui/Icon'

interface CounterpartyModalProps {
  initial?: Counterparty
  onClose: () => void
  onSubmit: (input: CounterpartyInput) => Promise<void>
}

export function CounterpartyModal({ initial, onClose, onSubmit }: CounterpartyModalProps) {
  const isEdit = initial !== undefined
  const [type, setType] = useState<CounterpartyType>(initial?.type ?? 'unit')
  const [name, setName] = useState(initial?.name ?? '')
  const [legalForm, setLegalForm] = useState<LegalForm>(initial?.legalForm ?? 'LEGAL_ENTITY')
  const [contactPerson, setContactPerson] = useState(initial?.contactPerson ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [channel, setChannel] = useState<Channel | ''>(initial?.channel ?? '')
  const [note, setNote] = useState(initial?.note ?? '')
  const [firstContactAt, setFirstContactAt] = useState(
    initial?.firstContactAt ? initial.firstContactAt.slice(0, 10) : '',
  )
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (name.trim() === '') {
      setError('Вкажіть назву контрагента')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await onSubmit({
        type,
        name: name.trim(),
        legalForm,
        contactPerson,
        phone,
        email: email.trim() || undefined,
        channel: channel || undefined,
        note,
        firstContactAt: firstContactAt || undefined,
      })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не вдалося зберегти контрагента')
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title={isEdit ? 'Редагування контрагента' : 'Новий контрагент'}
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
      <div className="form-row">
        <div className="field">
          <label>Тип</label>
          <select
            className="select"
            value={type}
            disabled={isEdit}
            onChange={(e) => setType(e.target.value as CounterpartyType)}
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {isEdit && <div className="field__hint">Тип змінити не можна.</div>}
        </div>
        <div className="field">
          <label>Форма</label>
          <select
            className="select"
            value={legalForm}
            onChange={(e) => setLegalForm(e.target.value as LegalForm)}
          >
            {LEGAL_FORM_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label>Назва</label>
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Напр. 93 ОМБр «Холодний Яр»"
        />
      </div>
      <div className="form-row">
        <div className="field">
          <label>Контактна особа</label>
          <input
            className="input"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            placeholder="ПІБ"
          />
        </div>
        <div className="field">
          <label>Телефон</label>
          <input
            className="input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+380 ..."
          />
        </div>
      </div>
      <div className="form-row">
        <div className="field">
          <label>Email</label>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ім'я@приклад.com"
          />
        </div>
        <div className="field">
          <label>Канал зв'язку</label>
          <select
            className="select"
            value={channel}
            onChange={(e) => setChannel(e.target.value as Channel | '')}
          >
            <option value="">—</option>
            {CHANNEL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label>Перша взаємодія (необов'язково)</label>
        <input
          className="input"
          type="date"
          value={firstContactAt}
          onChange={(e) => setFirstContactAt(e.target.value)}
        />
      </div>
      <div className="field">
        <label>Примітка (необов'язково)</label>
        <textarea
          className="textarea"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Коротка нотатка про контрагента..."
        />
      </div>
    </Modal>
  )
}
