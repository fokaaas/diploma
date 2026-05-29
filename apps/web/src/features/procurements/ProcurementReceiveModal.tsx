import { useState } from 'react'
import { ApiError } from '../../lib/api/client'
import type { ProcurementDetail, ReceiveInput } from '../../lib/api/procurements'
import type { Warehouse } from '../../lib/api/warehouses'
import { Modal } from '../../components/ui/Modal'
import { Icon } from '../../components/ui/Icon'

interface ProcurementReceiveModalProps {
  procurement: ProcurementDetail
  warehouses: Warehouse[]
  onClose: () => void
  onSubmit: (input: ReceiveInput) => Promise<void>
}

export function ProcurementReceiveModal({
  procurement,
  warehouses,
  onClose,
  onSubmit,
}: ProcurementReceiveModalProps) {
  const receivable = procurement.lines.filter((l) => l.itemId !== null)
  const [warehouseName, setWarehouseName] = useState(warehouses[0]?.name ?? 'Основний склад')
  const [note, setNote] = useState('')
  const [quantities, setQuantities] = useState<Record<string, string>>(
    Object.fromEntries(receivable.map((l) => [l.id, String(l.quantity)])),
  )
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (warehouseName.trim() === '') return setError('Вкажіть склад')
    const lines = receivable
      .map((l) => ({ procurementLineId: l.id, quantity: Number(quantities[l.id]) }))
      .filter((l) => Number.isInteger(l.quantity) && l.quantity > 0)
    if (lines.length === 0) return setError('Вкажіть кількість хоча б для однієї позиції')
    setError(null)
    setSubmitting(true)
    try {
      await onSubmit({ warehouseName: warehouseName.trim(), note: note.trim() || undefined, lines })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не вдалося прийняти на склад')
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title={`Прийом на склад · ${procurement.number}`}
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
            disabled={submitting || receivable.length === 0}
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
      <div className="note note--info mb-3">
        <Icon name="info" size={16} />
        <div>
          Прийняті позиції додаються до залишків складу (рух ТМЦ), а закупівля переходить
          у статус «Отримано».
        </div>
      </div>

      <div className="form-row" style={{ marginBottom: 12 }}>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Склад</label>
          <input
            className="input"
            list="warehouse-options"
            value={warehouseName}
            onChange={(e) => setWarehouseName(e.target.value)}
            placeholder="Назва складу"
          />
          <datalist id="warehouse-options">
            {warehouses.map((w) => (
              <option key={w.id} value={w.name} />
            ))}
          </datalist>
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Примітка</label>
          <input
            className="input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Необов'язково"
          />
        </div>
      </div>

      {receivable.length === 0 ? (
        <div className="muted text-sm">
          У закупівлі немає позицій із номенклатури складу — приймати нічого.
        </div>
      ) : (
        <table className="data" style={{ border: '1px solid var(--border)', borderRadius: 6 }}>
          <thead>
            <tr>
              <th>Позиція</th>
              <th>SKU</th>
              <th style={{ width: 110 }}>Замовлено</th>
              <th style={{ width: 120 }}>Прийнято</th>
            </tr>
          </thead>
          <tbody>
            {receivable.map((l) => (
              <tr key={l.id} style={{ cursor: 'default' }}>
                <td>{l.name}</td>
                <td className="mono text-sm muted">{l.sku ?? '—'}</td>
                <td className="col-num">{l.quantity}</td>
                <td>
                  <input
                    className="input"
                    type="number"
                    min={0}
                    style={{ width: 90 }}
                    value={quantities[l.id] ?? ''}
                    onChange={(e) =>
                      setQuantities((prev) => ({ ...prev, [l.id]: e.target.value }))
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Modal>
  )
}
