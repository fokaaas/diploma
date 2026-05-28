import { useNavigate } from '@tanstack/react-router'
import { useToast } from '../../context/toast-context'
import { ITEMS } from '../../data/items'
import { MOVEMENTS } from '../../data/movements'
import { getItemBySku } from '../../data/queries'
import { formatNumber } from '../../lib/format'
import { PageHeader } from '../../components/layout/PageHeader'
import { Icon } from '../../components/ui/Icon'

export function ItemCard({ sku }: { sku: string }) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const item = getItemBySku(sku) ?? ITEMS[0]

  return (
    <div className="page">
      <PageHeader
        breadcrumb={[{ label: 'Склад', onClick: () => void navigate({ to: '/warehouse' }) }, { label: item.sku }]}
        title={item.name}
        subtitle={`${item.category} · ${item.location}`}
        actions={
          <>
            <button className="btn" onClick={() => showToast('Редагування позиції незабаром')}>
              <Icon name="edit" size={15} />
              Редагувати
            </button>
            <button
              className="btn btn--primary"
              onClick={() => void navigate({ to: '/warehouse', search: { issue: true } })}
            >
              <Icon name="upload" size={15} />
              Видача
            </button>
          </>
        }
      />

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat">
          <div className="stat__label">Поточний залишок</div>
          <div className="stat__value">
            {item.stock} <span style={{ fontSize: 16, color: 'var(--text-muted)' }}>{item.unit}</span>
          </div>
        </div>
        <div className="stat">
          <div className="stat__label">Мінімальний рівень</div>
          <div className="stat__value">
            {item.minStock} <span style={{ fontSize: 16, color: 'var(--text-muted)' }}>{item.unit}</span>
          </div>
        </div>
        <div className="stat">
          <div className="stat__label">Середня ціна</div>
          <div className="stat__value tabular" style={{ fontSize: 22 }}>
            {formatNumber(item.lastPrice)} ₴
          </div>
        </div>
        <div className="stat">
          <div className="stat__label">Стан</div>
          <div style={{ marginTop: 6 }}>
            {item.warn ? (
              <span className="badge badge--warning" style={{ fontSize: 14 }}>
                Потребує поповнення
              </span>
            ) : (
              <span className="badge badge--success" style={{ fontSize: 14 }}>
                В нормі
              </span>
            )}
          </div>
          <div className="stat__sub mt-2">{item.warn ? 'Замовте додаткові обсяги' : 'Запасу достатньо'}</div>
        </div>
      </div>

      <div className="card">
        <div className="card__header">
          <h3 className="card__title">Історія руху</h3>
        </div>
        <table className="data">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Тип</th>
              <th className="text-right">К-сть</th>
              <th>Документ</th>
              <th>Користувач</th>
            </tr>
          </thead>
          <tbody>
            {MOVEMENTS.map((m) => (
              <tr key={m.id} style={{ cursor: 'default' }}>
                <td className="col-muted">{m.date}</td>
                <td>
                  {m.type === 'in' ? (
                    <span className="badge badge--success">+ прийом</span>
                  ) : (
                    <span className="badge badge--warning">− видача</span>
                  )}
                </td>
                <td className="col-num">
                  {m.type === 'in' ? '+' : '−'}
                  {m.qty}
                </td>
                <td>
                  <span className="entity-link">{m.source}</span>
                </td>
                <td className="col-muted">{m.user}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
