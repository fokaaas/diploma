import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '../../lib/auth/session'
import { formatNumber } from '../../lib/format'
import type { StockLevelItem, StockMovement } from '../../lib/api/stock'
import { PageHeader } from '../../components/layout/PageHeader'
import { Icon } from '../../components/ui/Icon'
import { EmptyState } from '../../components/ui/EmptyState'

const CAN_MANAGE: Record<string, boolean> = { admin: true, coordinator: true }

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('uk-UA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function ItemCard({
  sku,
  levels,
  movements,
}: {
  sku: string
  levels: StockLevelItem[]
  movements: StockMovement[]
}) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const canManage = CAN_MANAGE[user?.role ?? ''] ?? false

  const itemLevels = levels.filter((l) => l.sku === sku)
  const head = itemLevels[0]
  const total = itemLevels.reduce((sum, l) => sum + l.quantity, 0)
  const history = head ? movements.filter((m) => m.itemName === head.name) : []

  if (!head) {
    return (
      <div className="page">
        <PageHeader
          breadcrumb={[{ label: 'Склад', onClick: () => void navigate({ to: '/warehouse' }) }, { label: sku }]}
          title={sku}
        />
        <EmptyState title="Позиції немає на складі" hint="Залишки за цією позицією відсутні" />
      </div>
    )
  }

  const low = total < head.minStock

  return (
    <div className="page">
      <PageHeader
        breadcrumb={[{ label: 'Склад', onClick: () => void navigate({ to: '/warehouse' }) }, { label: head.sku }]}
        title={head.name}
        subtitle={`${head.categoryName} · ${itemLevels.map((l) => l.warehouseName).join(', ')}`}
        actions={
          canManage ? (
            <button
              className="btn btn--primary"
              onClick={() => void navigate({ to: '/warehouse', search: { issue: true } })}
            >
              <Icon name="upload" size={15} />
              Видача
            </button>
          ) : null
        }
      />

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat">
          <div className="stat__label">Поточний залишок</div>
          <div className="stat__value">
            {total} <span style={{ fontSize: 16, color: 'var(--text-muted)' }}>{head.unit}</span>
          </div>
        </div>
        <div className="stat">
          <div className="stat__label">Мінімальний рівень</div>
          <div className="stat__value">
            {head.minStock} <span style={{ fontSize: 16, color: 'var(--text-muted)' }}>{head.unit}</span>
          </div>
        </div>
        <div className="stat">
          <div className="stat__label">Середня ціна</div>
          <div className="stat__value tabular" style={{ fontSize: 22 }}>
            {head.lastPrice === null ? '—' : `${formatNumber(head.lastPrice)} ₴`}
          </div>
        </div>
        <div className="stat">
          <div className="stat__label">Стан</div>
          <div style={{ marginTop: 6 }}>
            {low ? (
              <span className="badge badge--warning" style={{ fontSize: 14 }}>
                Потребує поповнення
              </span>
            ) : (
              <span className="badge badge--success" style={{ fontSize: 14 }}>
                В нормі
              </span>
            )}
          </div>
          <div className="stat__sub mt-2">{low ? 'Замовте додаткові обсяги' : 'Запасу достатньо'}</div>
        </div>
      </div>

      <div className="detail-grid">
        <div>
          <div className="card">
            <div className="card__header">
              <h3 className="card__title">Історія руху</h3>
              <span className="muted text-sm">{history.length}</span>
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
                {history.map((m) => (
                  <tr key={m.id} style={{ cursor: 'default' }}>
                    <td className="col-muted">{formatDateTime(m.occurredAt)}</td>
                    <td>
                      {m.type === 'in' ? (
                        <span className="badge badge--success">+ прийом</span>
                      ) : (
                        <span className="badge badge--warning">− видача</span>
                      )}
                    </td>
                    <td className="col-num">
                      {m.type === 'in' ? '+' : '−'}
                      {m.quantity}
                    </td>
                    <td>{m.sourceNumber ?? '—'}</td>
                    <td className="col-muted">{m.performedByName}</td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr style={{ cursor: 'default' }}>
                    <td colSpan={5} className="muted text-center" style={{ padding: 18 }}>
                      Рухів немає
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card__header">
              <h3 className="card__title">Залишки по складах</h3>
            </div>
            <div className="card__body">
              {itemLevels.map((l) => (
                <div
                  key={l.warehouseId}
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}
                >
                  <span className="muted">{l.warehouseName}</span>
                  <span className="tabular">
                    {l.quantity} {l.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
