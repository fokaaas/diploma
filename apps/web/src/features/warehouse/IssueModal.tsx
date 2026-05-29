import { useState } from 'react'
import { sessionStore } from '../../lib/auth/session'
import { ApiError } from '../../lib/api/client'
import {
  getRequest,
  type RequestDetail,
  type RequestListItem,
} from '../../lib/api/requests'
import type { IssuanceInput, StockLevelItem } from '../../lib/api/stock'
import type { Warehouse } from '../../lib/api/warehouses'
import { Modal } from '../../components/ui/Modal'
import { Icon } from '../../components/ui/Icon'

interface IssueModalProps {
  requests: RequestListItem[]
  warehouses: Warehouse[]
  levels: StockLevelItem[]
  onClose: () => void
  onSubmit: (input: IssuanceInput) => Promise<void>
}

const DELIVERY = ['Авто фонду', 'Самовивіз', 'Транспортна компанія']

export function IssueModal({
  requests,
  warehouses,
  levels,
  onClose,
  onSubmit,
}: IssueModalProps) {
  const token = sessionStore.getAccessToken() ?? ''
  const [requestId, setRequestId] = useState('')
  const [detail, setDetail] = useState<RequestDetail | null>(null)
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id ?? '')
  const [recipient, setRecipient] = useState('')
  const [delivery, setDelivery] = useState(DELIVERY[0])
  const [quantities, setQuantities] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const warehouseName = warehouses.find((w) => w.id === warehouseId)?.name ?? ''

  const selectRequest = async (id: string) => {
    setRequestId(id)
    setDetail(null)
    if (!id) return
    try {
      const loaded = await getRequest(token, id)
      setDetail(loaded)
      setQuantities(
        Object.fromEntries(
          loaded.lines.map((l) => [
            l.id,
            String(Math.max(0, l.quantity - l.receivedQuantity)),
          ]),
        ),
      )
    } catch {
      setError('Не вдалося завантажити заявку')
    }
  }

  const availableFor = (
    sku: string | null,
  ): { itemId?: string; available: number } => {
    if (!sku) return { available: 0 }
    const level = levels.find((l) => l.sku === sku && l.warehouseId === warehouseId)
    return { itemId: level?.itemId, available: level?.quantity ?? 0 }
  }

  const handleSubmit = async () => {
    if (!requestId || !detail) return setError('Оберіть заявку')
    if (!warehouseId) return setError('Оберіть склад')
    if (recipient.trim() === '') return setError('Вкажіть отримувача')
    const lines: IssuanceInput['lines'] = []
    for (const line of detail.lines) {
      const qty = Number(quantities[line.id])
      if (!qty) continue
      const { itemId, available } = availableFor(line.sku)
      if (!itemId) return setError(`Немає на складі: ${line.name}`)
      if (!Number.isInteger(qty) || qty < 1) return setError('Некоректна кількість')
      if (qty > available) return setError(`Перевищено залишок: ${line.name}`)
      lines.push({ itemId, quantity: qty })
    }
    if (lines.length === 0) {
      return setError('Вкажіть кількість хоча б для однієї позиції')
    }
    setError(null)
    setSubmitting(true)
    try {
      await onSubmit({
        requestId,
        recipientName: recipient.trim(),
        deliveryMethod: delivery,
        warehouseName,
        lines,
      })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не вдалося виконати видачу')
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title="Видача зі складу"
      onClose={onClose}
      size="lg"
      footer={
        <>
          <button className="btn" onClick={onClose}>
            Скасувати
          </button>
          <button
            className="btn btn--primary"
            onClick={() => void handleSubmit()}
            disabled={submitting || !detail}
          >
            <Icon name="check" size={15} />
            {submitting ? 'Видача…' : 'Виконати видачу'}
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
          <label>Заявка *</label>
          <select
            className="select"
            value={requestId}
            onChange={(e) => void selectRequest(e.target.value)}
          >
            <option value="">Оберіть заявку...</option>
            {requests.map((r) => (
              <option key={r.id} value={r.id}>
                {r.number} · {r.unitName}
              </option>
            ))}
          </select>
          <div className="field__hint">Статус заявки оновиться автоматично</div>
        </div>
        <div className="field">
          <label>Склад *</label>
          <select
            className="select"
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
          >
            {warehouses.length === 0 && <option value="">Немає складів</option>}
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="field">
          <label>Отримувач *</label>
          <input
            className="input"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="ПІБ отримувача"
          />
        </div>
        <div className="field">
          <label>Засіб доставки</label>
          <select
            className="select"
            value={delivery}
            onChange={(e) => setDelivery(e.target.value)}
          >
            {DELIVERY.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {detail && (
        <>
          <div className="section-title mt-3">Позиції до видачі</div>
          <table className="data" style={{ border: '1px solid var(--border)', borderRadius: 6 }}>
            <thead>
              <tr>
                <th>Позиція</th>
                <th className="text-right">Потрібно</th>
                <th className="text-right">На складі</th>
                <th style={{ width: 110 }}>До видачі</th>
              </tr>
            </thead>
            <tbody>
              {detail.lines.map((line) => {
                const remaining = Math.max(0, line.quantity - line.receivedQuantity)
                const { available } = availableFor(line.sku)
                return (
                  <tr key={line.id} style={{ cursor: 'default' }}>
                    <td>{line.name}</td>
                    <td className="col-num">{remaining}</td>
                    <td className="col-num">{available}</td>
                    <td>
                      <input
                        className="input"
                        type="number"
                        min={0}
                        style={{ width: 90 }}
                        value={quantities[line.id] ?? ''}
                        onChange={(e) =>
                          setQuantities((prev) => ({
                            ...prev,
                            [line.id]: e.target.value,
                          }))
                        }
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </>
      )}
    </Modal>
  )
}
