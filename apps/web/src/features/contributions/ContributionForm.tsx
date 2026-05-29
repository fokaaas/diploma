import { useState } from 'react'
import type { ContributionForm as Form } from '../../types/domain'
import { ApiError } from '../../lib/api/client'
import type {
  ContributionDetail,
  ContributionInput,
} from '../../lib/api/contributions'
import { Icon } from '../../components/ui/Icon'

export interface DonorOption {
  id: string
  name: string
}

interface ContributionFormProps {
  mode: 'create' | 'edit'
  initial?: ContributionDetail
  donors: DonorOption[]
  submitLabel: string
  onSubmit: (input: ContributionInput, files: File[]) => Promise<void>
}

function parseAmount(value: string): number {
  return Number(value.replace(/\s/g, '').replace(',', '.'))
}

export function ContributionForm({
  mode,
  initial,
  donors,
  submitLabel,
  onSubmit,
}: ContributionFormProps) {
  const [donorId, setDonorId] = useState(initial?.donorId ?? '')
  const [occurredAt, setOccurredAt] = useState(
    initial?.date ? initial.date.slice(0, 10) : '',
  )
  const [form, setForm] = useState<Form>(initial?.form ?? 'monetary')
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [currency, setCurrency] = useState(initial?.currency ?? 'UAH')
  const [purpose, setPurpose] = useState(initial?.purpose ?? '')
  const [baseDoc, setBaseDoc] = useState(initial?.baseDocumentLabel ?? '')
  const [itemName, setItemName] = useState(initial?.itemName ?? '')
  const [itemQuantity, setItemQuantity] = useState(
    initial?.itemQuantity ? String(initial.itemQuantity) : '',
  )
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isInKind = form === 'in-kind'

  const handleSubmit = async () => {
    if (!donorId) return setError('Оберіть донора')
    if (!occurredAt) return setError('Вкажіть дату надходження')
    const value = parseAmount(amount)
    if (!Number.isFinite(value) || value < 0) {
      return setError('Вкажіть коректну суму')
    }
    if (isInKind && itemName.trim() === '') {
      return setError('Для натурального внеску вкажіть позицію')
    }
    setError(null)
    setSubmitting(true)
    try {
      await onSubmit(
        {
          donorId,
          form,
          amount: value,
          currency: isInKind ? 'UAH' : currency,
          purpose: purpose.trim() || undefined,
          baseDocumentLabel: baseDoc.trim() || undefined,
          occurredAt,
          itemName: isInKind ? itemName.trim() : undefined,
          itemQuantity: isInKind ? parseAmount(itemQuantity) || undefined : undefined,
        },
        files,
      )
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не вдалося зберегти внесок')
      setSubmitting(false)
    }
  }

  return (
    <>
      {error && (
        <div className="note note--danger mb-3">
          <Icon name="alert" size={16} />
          <div>{error}</div>
        </div>
      )}

      <div className="card mb-4">
        <div className="card__header">
          <h3 className="card__title">Основна інформація</h3>
        </div>
        <div className="card__body">
          <div className="form-row">
            <div className="field">
              <label>Донор *</label>
              <select
                className="select"
                value={donorId}
                disabled={mode === 'edit'}
                onChange={(e) => setDonorId(e.target.value)}
              >
                <option value="" disabled>
                  Оберіть донора...
                </option>
                {donors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Дата надходження *</label>
              <input
                className="input"
                type="date"
                value={occurredAt}
                onChange={(e) => setOccurredAt(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label>Форма внеску *</label>
            <div className="segmented" style={{ width: 'fit-content' }}>
              <button aria-pressed={!isInKind} onClick={() => setForm('monetary')}>
                Грошовий
              </button>
              <button aria-pressed={isInKind} onClick={() => setForm('in-kind')}>
                Натуральний
              </button>
            </div>
          </div>

          {isInKind ? (
            <div className="form-row-3">
              <div className="field">
                <label>Позиція *</label>
                <input
                  className="input"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="напр. Аптечка IFAK"
                />
              </div>
              <div className="field">
                <label>Кількість</label>
                <input
                  className="input"
                  type="number"
                  min={1}
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="field">
                <label>Оцінка вартості, ₴ *</label>
                <input
                  className="input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                />
              </div>
            </div>
          ) : (
            <div className="form-row">
              <div className="field">
                <label>Сума, ₴ *</label>
                <input
                  className="input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                />
              </div>
              <div className="field">
                <label>Валюта</label>
                <select
                  className="select"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="UAH">UAH (гривня)</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
          )}

          <div className="field">
            <label>Призначення</label>
            <input
              className="input"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Цільове призначення внеску, якщо є"
            />
          </div>
          <div className="field">
            <label>Документ-основа</label>
            <input
              className="input"
              value={baseDoc}
              onChange={(e) => setBaseDoc(e.target.value)}
              placeholder="Платіжне доручення №..., Акт прийому №..."
            />
          </div>
        </div>
      </div>

      {mode === 'create' && (
        <div className="card mb-4">
          <div className="card__header">
            <h3 className="card__title">Документи</h3>
          </div>
          <div className="card__body">
            <label
              className="placeholder-img"
              style={{ padding: '28px 24px', cursor: 'pointer', display: 'block' }}
            >
              <input
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={(e) =>
                  e.target.files && setFiles((prev) => [...prev, ...Array.from(e.target.files!)])
                }
              />
              <Icon name="upload" size={22} color="var(--text-faint)" />
              <div className="mt-2">Натисніть, щоб обрати документи</div>
              <div className="text-xs faint">PDF / JPG / PNG · до 25 МБ</div>
            </label>
            {files.length > 0 && (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {files.map((f, i) => (
                  <div
                    key={`${f.name}-${i}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                  >
                    <Icon name="paperclip" size={14} color="var(--text-muted)" />
                    <span className="text-sm" style={{ flex: 1 }}>
                      {f.name}
                    </span>
                    <button
                      className="btn btn--icon btn--ghost"
                      aria-label="Прибрати файл"
                      onClick={() =>
                        setFiles((prev) => prev.filter((_, idx) => idx !== i))
                      }
                    >
                      <Icon name="x" size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="btn btn--primary"
          onClick={() => void handleSubmit()}
          disabled={submitting}
        >
          <Icon name="check" size={15} />
          {submitting ? 'Збереження…' : submitLabel}
        </button>
      </div>
    </>
  )
}
