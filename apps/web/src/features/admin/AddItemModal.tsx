import { useState } from 'react'
import type { Category, CreateItemInput } from '../../lib/api/dictionaries'
import { ApiError } from '../../lib/api/client'
import { Modal } from '../../components/ui/Modal'
import { Icon } from '../../components/ui/Icon'

interface AddItemModalProps {
  categories: Category[]
  onClose: () => void
  onSubmit: (input: CreateItemInput) => Promise<void>
}

export function AddItemModal({ categories, onClose, onSubmit }: AddItemModalProps) {
  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [unit, setUnit] = useState('шт')
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '')
  const [minStock, setMinStock] = useState('')
  const [lastPrice, setLastPrice] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setError(null)
    if (!categoryId) {
      setError('Спочатку додайте категорію')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({
        sku,
        name,
        unit,
        categoryId,
        minStock: minStock ? Number(minStock) : undefined,
        lastPrice: lastPrice ? Number(lastPrice) : undefined,
      })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не вдалося додати позицію')
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title="Нова позиція номенклатури"
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
      <div className="form-row">
        <div className="field">
          <label>SKU</label>
          <input className="input" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="DRN-FPV-7" />
        </div>
        <div className="field">
          <label>Одиниця</label>
          <input className="input" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="шт" />
        </div>
      </div>
      <div className="field">
        <label>Найменування</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder='FPV-дрон 7"' />
      </div>
      <div className="field">
        <label>Категорія</label>
        <select className="select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          {categories.length === 0 && <option value="">Немає категорій</option>}
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <div className="field">
          <label>Мінімальний залишок</label>
          <input
            className="input"
            type="number"
            min={0}
            value={minStock}
            onChange={(e) => setMinStock(e.target.value)}
            placeholder="0"
          />
        </div>
        <div className="field">
          <label>Орієнтовна ціна, ₴</label>
          <input
            className="input"
            type="number"
            min={0}
            value={lastPrice}
            onChange={(e) => setLastPrice(e.target.value)}
            placeholder="0"
          />
        </div>
      </div>
    </Modal>
  )
}
