import { useState } from 'react'
import { ApiError } from '../../lib/api/client'
import type { ManualReceiptInput } from '../../lib/api/stock'
import type { Item } from '../../lib/api/dictionaries'
import type { Warehouse } from '../../lib/api/warehouses'
import { Modal } from '../../components/ui/Modal'
import { Icon } from '../../components/ui/Icon'

interface StockReceiveModalProps {
  items: Item[]
  warehouses: Warehouse[]
  onClose: () => void
  onSubmit: (input: ManualReceiptInput) => Promise<void>
}

export function StockReceiveModal({
  items,
  warehouses,
  onClose,
  onSubmit,
}: StockReceiveModalProps) {
  const [itemId, setItemId] = useState('')
  const [warehouseName, setWarehouseName] = useState(
    warehouses[0]?.name ?? 'Основний склад',
  )
  const [quantity, setQuantity] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!itemId) return setError('Оберіть позицію')
    if (warehouseName.trim() === '') return setError('Вкажіть склад')
    const qty = Number(quantity)
    if (!Number.isInteger(qty) || qty < 1) {
      return setError('Кількість має бути цілим числом ≥ 1')
    }
    setError(null)
    setSubmitting(true)
    try {
      await onSubmit({
        itemId,
        warehouseName: warehouseName.trim(),
        quantity: qty,
        note: note.trim() || undefined,
      })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не вдалося прийняти на склад')
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title="Прийом на склад"
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
            {submitting ? 'Прийом…' : 'Прийняти'}
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
        <label>Позиція *</label>
        <select className="select" value={itemId} onChange={(e) => setItemId(e.target.value)}>
          <option value="" disabled>
            Оберіть позицію з номенклатури...
          </option>
          {items.map((i) => (
            <option key={i.id} value={i.id}>
              {i.sku} · {i.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <div className="field">
          <label>Склад *</label>
          <input
            className="input"
            list="receive-warehouse-options"
            value={warehouseName}
            onChange={(e) => setWarehouseName(e.target.value)}
            placeholder="Назва складу"
          />
          <datalist id="receive-warehouse-options">
            {warehouses.map((w) => (
              <option key={w.id} value={w.name} />
            ))}
          </datalist>
        </div>
        <div className="field">
          <label>Кількість *</label>
          <input
            className="input"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
          />
        </div>
      </div>
      <div className="field">
        <label>Примітка</label>
        <input
          className="input"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Необов'язково"
        />
      </div>
    </Modal>
  )
}
