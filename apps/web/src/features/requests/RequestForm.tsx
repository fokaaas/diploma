import { useState } from 'react'
import type { Priority } from '../../types/domain'
import { ApiError } from '../../lib/api/client'
import { CHANNEL_OPTIONS, type Channel } from '../../lib/api/counterparties'
import type { RequestDetail, RequestInput } from '../../lib/api/requests'
import type { Member } from '../../lib/api/users'
import { Icon } from '../../components/ui/Icon'

export interface UnitOption {
  id: string
  name: string
}

interface LineState {
  key: number
  name: string
  sku: string
  quantity: string
  unit: string
  techSpec: string
}

interface RequestFormProps {
  mode: 'create' | 'edit'
  initial?: RequestDetail
  units: UnitOption[]
  members: Member[]
  submitLabel: string
  onSubmit: (input: RequestInput, files: File[]) => Promise<void>
}

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'high', label: 'Високий' },
  { value: 'med', label: 'Середній' },
  { value: 'low', label: 'Низький' },
]

let lineCounter = 0
const nextKey = () => ++lineCounter

function initialLines(initial?: RequestDetail): LineState[] {
  if (initial && initial.lines.length > 0) {
    return initial.lines.map((line) => ({
      key: nextKey(),
      name: line.name,
      sku: line.sku ?? '',
      quantity: String(line.quantity),
      unit: line.unit,
      techSpec: line.techSpec ?? '',
    }))
  }
  return [{ key: nextKey(), name: '', sku: '', quantity: '', unit: 'шт', techSpec: '' }]
}

export function RequestForm({
  mode,
  initial,
  units,
  members,
  submitLabel,
  onSubmit,
}: RequestFormProps) {
  const [unitId, setUnitId] = useState(initial?.unitId ?? '')
  const [contact, setContact] = useState(initial?.unitContactName ?? '')
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'med')
  const [deadline, setDeadline] = useState(
    initial?.deadline ? initial.deadline.slice(0, 10) : '',
  )
  const [channel, setChannel] = useState<Channel | ''>(initial?.channel ?? '')
  const [assigneeId, setAssigneeId] = useState(
    initial?.assigneeName
      ? (members.find((m) => m.fullName === initial.assigneeName)?.id ?? '')
      : '',
  )
  const [lines, setLines] = useState<LineState[]>(() => initialLines(initial))
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const setLine = (key: number, patch: Partial<LineState>) =>
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)))
  const addLine = () =>
    setLines((prev) => [
      ...prev,
      { key: nextKey(), name: '', sku: '', quantity: '', unit: 'шт', techSpec: '' },
    ])
  const removeLine = (key: number) =>
    setLines((prev) => prev.filter((l) => l.key !== key))

  const addFiles = (list: FileList | null) => {
    if (list) setFiles((prev) => [...prev, ...Array.from(list)])
  }

  const handleSubmit = async () => {
    if (!unitId) return setError('Оберіть підрозділ')
    if (contact.trim() === '') return setError('Вкажіть контактну особу')
    const filled = lines.filter((l) => l.name.trim() !== '')
    if (filled.length === 0) return setError('Додайте хоча б одну позицію')
    const parsed = filled.map((l) => ({
      name: l.name.trim(),
      sku: l.sku.trim() || undefined,
      quantity: Number(l.quantity),
      unit: l.unit.trim() || 'шт',
      techSpec: l.techSpec.trim() || undefined,
    }))
    if (parsed.some((l) => !Number.isInteger(l.quantity) || l.quantity < 1)) {
      return setError('Кількість у кожній позиції має бути цілим числом ≥ 1')
    }
    setError(null)
    setSubmitting(true)
    try {
      await onSubmit(
        {
          unitId,
          unitContactName: contact.trim(),
          priority,
          deadline: deadline || undefined,
          channel: channel || undefined,
          assigneeId: assigneeId || undefined,
          lines: parsed,
        },
        files,
      )
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не вдалося зберегти заявку')
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
              <label>Підрозділ (ініціатор) *</label>
              <select
                className="select"
                value={unitId}
                disabled={mode === 'edit'}
                onChange={(e) => setUnitId(e.target.value)}
              >
                <option value="" disabled>
                  Оберіть підрозділ...
                </option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Координатор від підрозділу *</label>
              <input
                className="input"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="ПІБ контактної особи"
              />
            </div>
          </div>
          <div className="form-row-3">
            <div className="field">
              <label>Дедлайн</label>
              <input
                className="input"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Пріоритет</label>
              <select
                className="select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
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
            <label>Виконавець</label>
            <select
              className="select"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
            >
              <option value="">Не призначено</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card__header">
          <h3 className="card__title">Позиції до забезпечення</h3>
          <button className="btn btn--sm" onClick={addLine}>
            <Icon name="plus" size={13} />
            Додати рядок
          </button>
        </div>
        <table className="data">
          <thead>
            <tr>
              <th>Найменування</th>
              <th style={{ width: 130 }}>SKU</th>
              <th style={{ width: 90 }}>К-сть</th>
              <th style={{ width: 80 }}>Од.</th>
              <th>Технічна вимога</th>
              <th style={{ width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.key} style={{ cursor: 'default' }}>
                <td>
                  <input
                    className="input"
                    value={l.name}
                    onChange={(e) => setLine(l.key, { name: e.target.value })}
                    placeholder={'напр. FPV-дрон 7"'}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    value={l.sku}
                    onChange={(e) => setLine(l.key, { sku: e.target.value })}
                    placeholder="SKU"
                  />
                </td>
                <td>
                  <input
                    className="input"
                    type="number"
                    min={1}
                    value={l.quantity}
                    onChange={(e) => setLine(l.key, { quantity: e.target.value })}
                    placeholder="0"
                  />
                </td>
                <td>
                  <input
                    className="input"
                    value={l.unit}
                    onChange={(e) => setLine(l.key, { unit: e.target.value })}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    value={l.techSpec}
                    onChange={(e) => setLine(l.key, { techSpec: e.target.value })}
                    placeholder="Частота, спеці, інше"
                  />
                </td>
                <td>
                  <button
                    className="btn btn--icon btn--ghost"
                    onClick={() => removeLine(l.key)}
                    aria-label="Видалити рядок"
                  >
                    <Icon name="trash" size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="field__hint" style={{ padding: '0 14px 12px' }}>
          Якщо SKU збігається з номенклатурою складу — для оцінки суми
          використається остання ціна позиції.
        </div>
      </div>

      {mode === 'create' && (
        <div className="card mb-4">
          <div className="card__header">
            <h3 className="card__title">Вкладення</h3>
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
                onChange={(e) => addFiles(e.target.files)}
              />
              <div>
                <Icon name="upload" size={22} color="var(--text-faint)" />
              </div>
              <div className="mt-2">Натисніть, щоб обрати файли</div>
              <div className="text-xs faint">
                фото, документи, голосові повідомлення · до 25 МБ
              </div>
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
