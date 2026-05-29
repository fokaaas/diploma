import { useMemo, useState } from 'react'
import { getRouteApi, useNavigate, useRouter } from '@tanstack/react-router'
import { useToast } from '../../context/toast-context'
import { useAuth, sessionStore } from '../../lib/auth/session'
import {
  createIssuance,
  createManualReceipt,
  type IssuanceInput,
  type ManualReceiptInput,
  type StockLevelItem,
} from '../../lib/api/stock'
import { downloadCsv } from '../../lib/export/csv'
import { PageHeader } from '../../components/layout/PageHeader'
import { Icon } from '../../components/ui/Icon'
import { Money } from '../../components/ui/Money'
import { FilterDropdown } from '../../components/ui/FilterDropdown'
import { IssueModal } from './IssueModal'
import { StockReceiveModal } from './StockReceiveModal'

type Tab = 'stock' | 'movements' | 'low'

const CAN_MANAGE: Record<string, boolean> = { admin: true, coordinator: true }
const routeApi = getRouteApi('/_app/warehouse/')

function stockState(qty: number, min: number): 'low' | 'enough' | 'ok' {
  if (qty < min) return 'low'
  if (qty >= min * 1.5) return 'ok'
  return 'enough'
}

function StateBadge({ qty, min }: { qty: number; min: number }) {
  const state = stockState(qty, min)
  if (state === 'low') return <span className="badge badge--warning">низький</span>
  if (state === 'ok') return <span className="badge badge--success">норма</span>
  return <span className="badge badge--plain">достатньо</span>
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('uk-UA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function monthKeyOf(value: string): string {
  const d = new Date(value)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function WarehouseScreen({ autoOpenIssue = false }: { autoOpenIssue?: boolean }) {
  const navigate = useNavigate()
  const router = useRouter()
  const { showToast } = useToast()
  const { user } = useAuth()
  const { levels, movements, warehouses, requests, items } = routeApi.useLoaderData()
  const token = sessionStore.getAccessToken() ?? ''
  const canManage = CAN_MANAGE[user?.role ?? ''] ?? false

  const [tab, setTab] = useState<Tab>('stock')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [warehouse, setWarehouse] = useState('all')
  const [moveSearch, setMoveSearch] = useState('')
  const [moveType, setMoveType] = useState('all')
  const [moveMonth, setMoveMonth] = useState('all')
  const [issueOpen, setIssueOpen] = useState(autoOpenIssue)
  const [receiveOpen, setReceiveOpen] = useState(false)

  const lowCount = useMemo(
    () => levels.filter((l) => l.quantity < l.minStock).length,
    [levels],
  )
  const categoryOptions = useMemo(() => {
    const set = new Set(levels.map((l) => l.categoryName))
    return Array.from(set, (name) => ({ value: name, label: name }))
  }, [levels])
  const warehouseOptions = useMemo(() => {
    const map = new Map(levels.map((l) => [l.warehouseId, l.warehouseName]))
    return Array.from(map, ([value, label]) => ({ value, label }))
  }, [levels])
  const monthOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const m of movements) {
      const key = monthKeyOf(m.occurredAt)
      if (!map.has(key)) {
        map.set(
          key,
          new Date(m.occurredAt).toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' }),
        )
      }
    }
    return Array.from(map, ([value, label]) => ({ value, label })).sort((a, b) =>
      b.value.localeCompare(a.value),
    )
  }, [movements])

  const stockRows = useMemo(() => {
    const query = search.trim().toLowerCase()
    return levels.filter((l) => {
      if (tab === 'low' && l.quantity >= l.minStock) return false
      if (category !== 'all' && l.categoryName !== category) return false
      if (warehouse !== 'all' && l.warehouseId !== warehouse) return false
      if (query && !`${l.name} ${l.sku}`.toLowerCase().includes(query)) return false
      return true
    })
  }, [levels, tab, search, category, warehouse])

  const movementRows = useMemo(() => {
    const query = moveSearch.trim().toLowerCase()
    return movements.filter((m) => {
      if (moveType !== 'all' && m.type !== moveType) return false
      if (moveMonth !== 'all' && monthKeyOf(m.occurredAt) !== moveMonth) return false
      if (query && !`${m.itemName} ${m.sourceNumber ?? ''}`.toLowerCase().includes(query))
        return false
      return true
    })
  }, [movements, moveSearch, moveType, moveMonth])

  const closeIssue = () => {
    setIssueOpen(false)
    if (autoOpenIssue) void navigate({ to: '/warehouse' })
  }

  const handleIssue = async (input: IssuanceInput) => {
    await createIssuance(token, input)
    closeIssue()
    showToast('Видачу виконано')
    await router.invalidate()
  }

  const handleReceive = async (input: ManualReceiptInput) => {
    await createManualReceipt(token, input)
    setReceiveOpen(false)
    showToast('Прийнято на склад')
    await router.invalidate()
  }

  const exportStock = () => {
    downloadCsv(
      'zalyshky.csv',
      ['SKU', 'Найменування', 'Категорія', 'Локація', 'Залишок', 'Од.', 'Мін.', 'Сер. ціна'],
      stockRows.map((l) => [
        l.sku,
        l.name,
        l.categoryName,
        l.warehouseName,
        l.quantity,
        l.unit,
        l.minStock,
        l.lastPrice ?? '',
      ]),
    )
    showToast('Експорт сформовано')
  }

  return (
    <div className="page">
      <PageHeader
        title="Склад"
        subtitle="Залишки, рух матеріальних цінностей, видача за заявками"
        actions={
          canManage ? (
            <>
              <button className="btn" onClick={() => setIssueOpen(true)}>
                <Icon name="upload" size={15} />
                Видача за заявкою
              </button>
              <button className="btn btn--primary" onClick={() => setReceiveOpen(true)}>
                <Icon name="plus" size={15} />
                Прийом на склад
              </button>
            </>
          ) : null
        }
      />

      <div className="tabs">
        <button className={`tab ${tab === 'stock' ? 'tab--active' : ''}`} onClick={() => setTab('stock')}>
          Залишки <span className="count">{levels.length}</span>
        </button>
        <button
          className={`tab ${tab === 'movements' ? 'tab--active' : ''}`}
          onClick={() => setTab('movements')}
        >
          Журнал руху <span className="count">{movements.length}</span>
        </button>
        <button className={`tab ${tab === 'low' ? 'tab--active' : ''}`} onClick={() => setTab('low')}>
          Низькі залишки <span className="count">{lowCount}</span>
        </button>
      </div>

      {tab === 'movements' ? (
        <div className="table-wrap">
          <div className="table-toolbar">
            <div className="table-search">
              <Icon name="search" size={14} color="var(--text-faint)" />
              <input
                placeholder="Пошук за позицією, документом..."
                value={moveSearch}
                onChange={(e) => setMoveSearch(e.target.value)}
              />
            </div>
            <FilterDropdown
              label="Тип"
              options={[
                { value: 'in', label: 'Прийом' },
                { value: 'out', label: 'Видача' },
              ]}
              value={moveType}
              onChange={setMoveType}
            />
            <FilterDropdown label="Період" options={monthOptions} value={moveMonth} onChange={setMoveMonth} />
            <div style={{ marginLeft: 'auto' }} className="muted text-sm">
              Знайдено: {movementRows.length}
            </div>
          </div>
          <table className="data">
            <thead>
              <tr>
                <th>№</th>
                <th>Дата</th>
                <th>Тип</th>
                <th>Позиція</th>
                <th className="text-right">К-сть</th>
                <th>Документ-основа</th>
                <th>Користувач</th>
              </tr>
            </thead>
            <tbody>
              {movementRows.map((m) => (
                <tr key={m.id} style={{ cursor: 'default' }}>
                  <td className="col-id">{m.number}</td>
                  <td className="col-muted">{formatDateTime(m.occurredAt)}</td>
                  <td>
                    {m.type === 'in' ? (
                      <span className="badge badge--success">прийом</span>
                    ) : (
                      <span className="badge badge--warning">видача</span>
                    )}
                  </td>
                  <td>{m.itemName}</td>
                  <td className="col-num">
                    {m.type === 'in' ? '+' : '−'}
                    {m.quantity}
                  </td>
                  <td>{m.sourceNumber ?? '—'}</td>
                  <td className="col-muted">{m.performedByName}</td>
                </tr>
              ))}
              {movementRows.length === 0 && (
                <tr style={{ cursor: 'default' }}>
                  <td colSpan={7} className="muted text-center" style={{ padding: 24 }}>
                    Рухів не знайдено
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-wrap">
          <div className="table-toolbar">
            <div className="table-search">
              <Icon name="search" size={14} color="var(--text-faint)" />
              <input
                placeholder="Пошук за назвою, SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <FilterDropdown label="Категорія" options={categoryOptions} value={category} onChange={setCategory} />
            <FilterDropdown label="Склад" options={warehouseOptions} value={warehouse} onChange={setWarehouse} />
            <button className="btn btn--sm" style={{ marginLeft: 'auto' }} onClick={exportStock}>
              <Icon name="download" size={14} />
              Експорт
            </button>
            <div className="muted text-sm">Знайдено: {stockRows.length}</div>
          </div>
          <table className="data">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Найменування</th>
                <th>Категорія</th>
                <th>Локація</th>
                <th className="text-right">Залишок</th>
                <th className="text-right">Мін.</th>
                <th>Стан</th>
                <th className="text-right">Сер. ціна</th>
                {canManage && <th style={{ width: 90 }} />}
              </tr>
            </thead>
            <tbody>
              {stockRows.map((l) => (
                <StockRow
                  key={`${l.itemId}-${l.warehouseId}`}
                  level={l}
                  canManage={canManage}
                  onOpen={() => void navigate({ to: '/warehouse/$sku', params: { sku: l.sku } })}
                  onIssue={() => setIssueOpen(true)}
                />
              ))}
              {stockRows.length === 0 && (
                <tr style={{ cursor: 'default' }}>
                  <td colSpan={canManage ? 9 : 8} className="muted text-center" style={{ padding: 24 }}>
                    Позицій не знайдено
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {issueOpen && (
        <IssueModal
          requests={requests}
          warehouses={warehouses}
          levels={levels}
          onClose={closeIssue}
          onSubmit={handleIssue}
        />
      )}
      {receiveOpen && (
        <StockReceiveModal
          items={items}
          warehouses={warehouses}
          onClose={() => setReceiveOpen(false)}
          onSubmit={handleReceive}
        />
      )}
    </div>
  )
}

function StockRow({
  level,
  canManage,
  onOpen,
  onIssue,
}: {
  level: StockLevelItem
  canManage: boolean
  onOpen: () => void
  onIssue: () => void
}) {
  return (
    <tr onClick={onOpen}>
      <td className="col-id">{level.sku}</td>
      <td style={{ fontWeight: 500 }}>{level.name}</td>
      <td className="col-muted">{level.categoryName}</td>
      <td className="col-muted">{level.warehouseName}</td>
      <td className="col-num">
        <strong>{level.quantity}</strong> <span className="muted">{level.unit}</span>
      </td>
      <td className="col-num muted">{level.minStock}</td>
      <td>
        <StateBadge qty={level.quantity} min={level.minStock} />
      </td>
      <td className="col-num">
        <Money value={level.lastPrice} />
      </td>
      {canManage && (
        <td>
          <button
            className="btn btn--sm btn--ghost"
            onClick={(e) => {
              e.stopPropagation()
              onIssue()
            }}
          >
            Видача
          </button>
        </td>
      )}
    </tr>
  )
}
