import { useState } from 'react'
import { ApiError } from '../../lib/api/client'
import type { ProcurementDetail, ProcurementInput } from '../../lib/api/procurements'
import { formatNumber } from '../../lib/format'
import { Icon } from '../../components/ui/Icon'

export interface SupplierOption {
  id: string
  name: string
}
export interface RequestOption {
  id: string
  number: string
  unitName: string
}
export interface ContributionOption {
  id: string
  number: string
  donorName: string
  unspent: number
}

interface LineState {
  key: number
  name: string
  sku: string
  quantity: string
  unitPrice: string
}
interface FundingState {
  key: number
  contributionId: string
  amount: string
}

interface ProcurementFormProps {
  mode: 'create' | 'edit'
  initial?: ProcurementDetail
  suppliers: SupplierOption[]
  requests: RequestOption[]
  contributions: ContributionOption[]
  submitLabel: string
  onSubmit: (input: ProcurementInput, files: File[]) => Promise<void>
}

let counter = 0
const nextKey = () => ++counter

function parseNum(value: string): number {
  return Number(value.replace(/\s/g, '').replace(',', '.'))
}

function initialLines(initial?: ProcurementDetail): LineState[] {
  if (initial && initial.lines.length > 0) {
    return initial.lines.map((l) => ({
      key: nextKey(),
      name: l.name,
      sku: l.sku ?? '',
      quantity: String(l.quantity),
      unitPrice: String(l.unitPrice),
    }))
  }
  return [{ key: nextKey(), name: '', sku: '', quantity: '', unitPrice: '' }]
}

function initialFunding(initial?: ProcurementDetail): FundingState[] {
  if (!initial) return []
  return initial.funding.map((f) => ({
    key: nextKey(),
    contributionId: f.contributionId,
    amount: String(f.allocatedAmount),
  }))
}

export function ProcurementForm({
  mode,
  initial,
  suppliers,
  requests,
  contributions,
  submitLabel,
  onSubmit,
}: ProcurementFormProps) {
  const [supplierId, setSupplierId] = useState(initial?.supplierId ?? '')
  const [requestId, setRequestId] = useState(initial?.requestId ?? '')
  const [orderedAt, setOrderedAt] = useState(
    initial?.date ? initial.date.slice(0, 10) : '',
  )
  const [lines, setLines] = useState<LineState[]>(() => initialLines(initial))
  const [funding, setFunding] = useState<FundingState[]>(() => initialFunding(initial))
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const setLine = (key: number, patch: Partial<LineState>) =>
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)))
  const addLine = () =>
    setLines((prev) => [...prev, { key: nextKey(), name: '', sku: '', quantity: '', unitPrice: '' }])
  const removeLine = (key: number) => setLines((prev) => prev.filter((l) => l.key !== key))

  const setFund = (key: number, patch: Partial<FundingState>) =>
    setFunding((prev) => prev.map((f) => (f.key === key ? { ...f, ...patch } : f)))
  const addFund = () =>
    setFunding((prev) => [...prev, { key: nextKey(), contributionId: '', amount: '' }])
  const removeFund = (key: number) => setFunding((prev) => prev.filter((f) => f.key !== key))

  const grandTotal = lines.reduce(
    (sum, l) => sum + (parseNum(l.quantity) || 0) * (parseNum(l.unitPrice) || 0),
    0,
  )

  const handleSubmit = async () => {
    if (!supplierId) return setError('Оберіть постачальника')
    if (!orderedAt) return setError('Вкажіть дату')
    const filled = lines.filter((l) => l.name.trim() !== '')
    if (filled.length === 0) return setError('Додайте хоча б одну позицію')
    const parsedLines = filled.map((l) => ({
      name: l.name.trim(),
      sku: l.sku.trim() || undefined,
      quantity: parseNum(l.quantity),
      unitPrice: parseNum(l.unitPrice),
    }))
    if (parsedLines.some((l) => !Number.isInteger(l.quantity) || l.quantity < 1)) {
      return setError('Кількість у кожній позиції має бути цілим числом ≥ 1')
    }
    if (parsedLines.some((l) => !Number.isFinite(l.unitPrice) || l.unitPrice < 0)) {
      return setError('Вкажіть коректну ціну в кожній позиції')
    }
    const fundingRows = funding.filter((f) => f.contributionId !== '')
    const parsedFunding = fundingRows.map((f) => ({
      contributionId: f.contributionId,
      allocatedAmount: parseNum(f.amount),
    }))
    if (parsedFunding.some((f) => !Number.isFinite(f.allocatedAmount) || f.allocatedAmount <= 0)) {
      return setError('Вкажіть суму для кожного джерела фінансування')
    }
    setError(null)
    setSubmitting(true)
    try {
      await onSubmit(
        {
          supplierId,
          requestId: requestId || undefined,
          orderedAt,
          lines: parsedLines,
          funding: parsedFunding,
        },
        files,
      )
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не вдалося зберегти закупівлю')
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
              <label>Постачальник *</label>
              <select
                className="select"
                value={supplierId}
                disabled={mode === 'edit'}
                onChange={(e) => setSupplierId(e.target.value)}
              >
                <option value="" disabled>
                  Оберіть...
                </option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Дата</label>
              <input
                className="input"
                type="date"
                value={orderedAt}
                onChange={(e) => setOrderedAt(e.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label>Під заявку</label>
            <select
              className="select"
              value={requestId}
              onChange={(e) => setRequestId(e.target.value)}
            >
              <option value="">Без прив'язки</option>
              {requests.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.number} · {r.unitName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card__header">
          <h3 className="card__title">Позиції</h3>
          <button className="btn btn--sm" onClick={addLine}>
            <Icon name="plus" size={13} />
            Додати рядок
          </button>
        </div>
        <table className="data">
          <thead>
            <tr>
              <th>Найменування</th>
              <th style={{ width: 120 }}>SKU</th>
              <th style={{ width: 90 }}>К-сть</th>
              <th style={{ width: 120 }}>Ціна</th>
              <th className="text-right" style={{ width: 120 }}>
                Сума
              </th>
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
                    placeholder={'FPV-дрон 7"'}
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
                    value={l.unitPrice}
                    onChange={(e) => setLine(l.key, { unitPrice: e.target.value })}
                    placeholder="0,00"
                  />
                </td>
                <td className="col-num tabular">
                  {formatNumber((parseNum(l.quantity) || 0) * (parseNum(l.unitPrice) || 0))} ₴
                </td>
                <td>
                  <button
                    className="btn btn--icon btn--ghost"
                    aria-label="Видалити рядок"
                    onClick={() => removeLine(l.key)}
                  >
                    <Icon name="trash" size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ cursor: 'default' }}>
              <td colSpan={4} className="text-right muted">
                Усього
              </td>
              <td className="col-num">
                <strong>{formatNumber(grandTotal)} ₴</strong>
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="card mb-4">
        <div className="card__header">
          <h3 className="card__title">Джерело фінансування</h3>
          <button className="btn btn--sm" onClick={addFund} disabled={contributions.length === 0}>
            <Icon name="plus" size={13} />
            Додати джерело
          </button>
        </div>
        <div className="card__body">
          {funding.length === 0 && (
            <div className="muted text-sm mb-2">
              Без прив'язки до внесків (необов'язково).
            </div>
          )}
          {funding.map((f) => (
            <div key={f.key} className="form-row" style={{ alignItems: 'end', marginBottom: 8 }}>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Внесок</label>
                <select
                  className="select"
                  value={f.contributionId}
                  onChange={(e) => setFund(f.key, { contributionId: e.target.value })}
                >
                  <option value="">Оберіть внесок...</option>
                  {contributions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.number} · {c.donorName} · залишок {formatNumber(c.unspent)} ₴
                    </option>
                  ))}
                </select>
              </div>
              <div className="field" style={{ marginBottom: 0, maxWidth: 200 }}>
                <label>Сума, ₴</label>
                <input
                  className="input"
                  value={f.amount}
                  onChange={(e) => setFund(f.key, { amount: e.target.value })}
                  placeholder="0,00"
                />
              </div>
              <button
                className="btn btn--icon btn--ghost"
                aria-label="Прибрати джерело"
                onClick={() => removeFund(f.key)}
              >
                <Icon name="trash" size={14} />
              </button>
            </div>
          ))}
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
              <div className="text-xs faint">рахунки, платіжки, накладні · до 25 МБ</div>
            </label>
            {files.length > 0 && (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {files.map((f, i) => (
                  <div key={`${f.name}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Icon name="paperclip" size={14} color="var(--text-muted)" />
                    <span className="text-sm" style={{ flex: 1 }}>
                      {f.name}
                    </span>
                    <button
                      className="btn btn--icon btn--ghost"
                      aria-label="Прибрати файл"
                      onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
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
