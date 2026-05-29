import { useMemo, useState } from 'react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useToast } from '../../context/toast-context'
import { useAuth } from '../../lib/auth/session'
import { downloadCsv } from '../../lib/export/csv'
import { REQUEST_STATUS_BY_KEY } from '../../data/statuses'
import type { Priority, RequestStatus } from '../../types/domain'
import { PageHeader } from '../../components/layout/PageHeader'
import { Icon } from '../../components/ui/Icon'
import { Money } from '../../components/ui/Money'
import { PriorityTag } from '../../components/ui/PriorityTag'
import { StatusBadge } from '../../components/ui/Badge'
import { FilterDropdown } from '../../components/ui/FilterDropdown'

type StatusFilter = 'all' | RequestStatus

const TABS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'Усі' },
  { key: 'new', label: 'Нові' },
  { key: 'confirmed', label: 'Підтверджені' },
  { key: 'progress', label: 'В роботі' },
  { key: 'partial', label: 'Часткові' },
  { key: 'fulfilled', label: 'Виконані' },
  { key: 'closed', label: 'Закриті' },
]

const PRIORITY_LABEL: Record<Priority, string> = {
  high: 'Висока',
  med: 'Середня',
  low: 'Низька',
}

const PRIORITY_OPTIONS = (Object.keys(PRIORITY_LABEL) as Priority[]).map(
  (value) => ({ value, label: PRIORITY_LABEL[value] }),
)

const CAN_MANAGE: Record<string, boolean> = { admin: true, coordinator: true }

const routeApi = getRouteApi('/_app/requests/')

function formatDate(value: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('uk-UA', { dateStyle: 'medium' })
}

function monthKey(value: string): string {
  const d = new Date(value)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function RequestsList() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { user } = useAuth()
  const { requests } = routeApi.useLoaderData()
  const canManage = CAN_MANAGE[user?.role ?? ''] ?? false

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [unitFilter, setUnitFilter] = useState('all')
  const [priority, setPriority] = useState('all')
  const [month, setMonth] = useState('all')
  const [search, setSearch] = useState('')

  const unitOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const r of requests) if (!map.has(r.unitId)) map.set(r.unitId, r.unitName)
    return Array.from(map, ([id, name]) => ({ id, name }))
  }, [requests])

  const monthOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const r of requests) {
      const key = monthKey(r.date)
      if (!map.has(key)) {
        map.set(
          key,
          new Date(r.date).toLocaleDateString('uk-UA', {
            month: 'long',
            year: 'numeric',
          }),
        )
      }
    }
    return Array.from(map, ([value, label]) => ({ value, label })).sort((a, b) =>
      b.value.localeCompare(a.value),
    )
  }, [requests])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return requests.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      if (unitFilter !== 'all' && r.unitId !== unitFilter) return false
      if (priority !== 'all' && r.priority !== priority) return false
      if (month !== 'all' && monthKey(r.date) !== month) return false
      if (query && !`${r.number} ${r.itemsSummary}`.toLowerCase().includes(query))
        return false
      return true
    })
  }, [requests, statusFilter, unitFilter, priority, month, search])

  const handleExport = () => {
    try {
      downloadCsv(
        'zayavky.csv',
        ['№', 'Дата', 'Підрозділ', 'Контакт', 'Позиції', 'Пріоритет', 'Дедлайн', 'Сума', 'Статус'],
        filtered.map((r) => [
          r.number,
          formatDate(r.date),
          r.unitName,
          r.unitContactName,
          r.itemsSummary,
          PRIORITY_LABEL[r.priority],
          formatDate(r.deadline),
          r.estimatedValue,
          REQUEST_STATUS_BY_KEY[r.status].label,
        ]),
      )
      showToast('Експорт сформовано')
    } catch {
      showToast('Не вдалося сформувати експорт')
    }
  }

  return (
    <div className="page">
      <PageHeader
        title="Заявки від військових підрозділів"
        subtitle="Реєстр потреб з підрозділів, життєвий цикл від нової до закритої"
        actions={
          <>
            <button className="btn" onClick={handleExport}>
              <Icon name="download" size={15} />
              Експорт
            </button>
            {canManage && (
              <button
                className="btn btn--primary"
                onClick={() => void navigate({ to: '/requests/new' })}
              >
                <Icon name="plus" size={15} />
                Нова заявка
              </button>
            )}
          </>
        }
      />

      <div className="tabs">
        {TABS.map((tab) => {
          const count =
            tab.key === 'all'
              ? requests.length
              : requests.filter((r) => r.status === tab.key).length
          return (
            <button
              key={tab.key}
              className={`tab ${statusFilter === tab.key ? 'tab--active' : ''}`}
              onClick={() => setStatusFilter(tab.key)}
            >
              {tab.label} {count > 0 && <span className="count">{count}</span>}
            </button>
          )
        })}
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="table-search">
            <Icon name="search" size={14} color="var(--text-faint)" />
            <input
              placeholder="Пошук за номером, позицією"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="filter-chip"
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
            style={{ background: unitFilter === 'all' ? 'var(--surface)' : 'var(--olive-50)' }}
          >
            <option value="all">Усі підрозділи</option>
            {unitOptions.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <FilterDropdown
            label="Пріоритет"
            options={PRIORITY_OPTIONS}
            value={priority}
            onChange={setPriority}
          />
          <FilterDropdown
            label="Період"
            options={monthOptions}
            value={month}
            onChange={setMonth}
          />
          <div style={{ marginLeft: 'auto' }} className="muted text-sm">
            Знайдено: {filtered.length}
          </div>
        </div>
        <table className="data">
          <thead>
            <tr>
              <th>№</th>
              <th>Дата</th>
              <th>Підрозділ</th>
              <th>Позиції</th>
              <th>Пріоритет</th>
              <th>Дедлайн</th>
              <th className="col-num">Сума</th>
              <th>Статус</th>
              <th style={{ width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.id}
                onClick={() =>
                  void navigate({
                    to: '/requests/$requestId',
                    params: { requestId: r.id },
                  })
                }
              >
                <td className="col-id">{r.number}</td>
                <td className="col-muted">{formatDate(r.date)}</td>
                <td>
                  <div style={{ fontWeight: 500 }}>{r.unitName}</div>
                  <div className="text-xs muted">{r.unitContactName}</div>
                </td>
                <td style={{ maxWidth: 280 }}>{r.itemsSummary || '—'}</td>
                <td>
                  <PriorityTag value={r.priority} />
                </td>
                <td className="col-muted">{formatDate(r.deadline)}</td>
                <td className="col-num">
                  <Money value={r.estimatedValue} />
                </td>
                <td>
                  <StatusBadge status={r.status} statuses={REQUEST_STATUS_BY_KEY} />
                </td>
                <td>
                  <Icon name="chevron-right" size={14} color="var(--text-faint)" />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr style={{ cursor: 'default' }}>
                <td colSpan={9} className="muted text-center" style={{ padding: 24 }}>
                  Заявок не знайдено
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
