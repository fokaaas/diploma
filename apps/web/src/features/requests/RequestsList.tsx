import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useToast } from '../../context/toast-context'
import { REQUESTS } from '../../data/requests'
import { COUNTERPARTIES } from '../../data/counterparties'
import { REQUEST_STATUS_BY_KEY } from '../../data/statuses'
import { getCounterparty } from '../../data/queries'
import type { RequestStatus } from '../../types/domain'
import { PageHeader } from '../../components/layout/PageHeader'
import { Icon } from '../../components/ui/Icon'
import { Money } from '../../components/ui/Money'
import { PriorityTag } from '../../components/ui/PriorityTag'
import { StatusBadge } from '../../components/ui/Badge'

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

export function RequestsList() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [unitFilter, setUnitFilter] = useState('all')
  const [search, setSearch] = useState('')

  const units = COUNTERPARTIES.filter((c) => c.type === 'unit')

  const filtered = useMemo(
    () =>
      REQUESTS.filter((r) => {
        if (statusFilter !== 'all' && r.status !== statusFilter) return false
        if (unitFilter !== 'all' && r.unit !== unitFilter) return false
        if (search && !`${r.id}${r.items}`.toLowerCase().includes(search.toLowerCase())) return false
        return true
      }),
    [statusFilter, unitFilter, search],
  )

  return (
    <div className="page">
      <PageHeader
        title="Заявки від військових підрозділів"
        subtitle="Реєстр потреб з підрозділів, життєвий цикл від нової до закритої"
        actions={
          <>
            <button className="btn" onClick={() => showToast('Експорт сформовано')}>
              <Icon name="download" size={15} />
              Експорт
            </button>
            <button className="btn btn--primary" onClick={() => void navigate({ to: '/requests/new' })}>
              <Icon name="plus" size={15} />
              Нова заявка
            </button>
          </>
        }
      />

      <div className="tabs">
        {TABS.map((tab) => {
          const count =
            tab.key === 'all' ? REQUESTS.length : REQUESTS.filter((r) => r.status === tab.key).length
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
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <button className="filter-chip">
            <Icon name="filter" size={13} />
            Пріоритет
            <span className="filter-chip__caret">▾</span>
          </button>
          <button className="filter-chip">
            <Icon name="calendar" size={13} />
            Травень 2026
            <span className="filter-chip__caret">▾</span>
          </button>
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
              <th>Сума</th>
              <th>Статус</th>
              <th style={{ width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.id}
                onClick={() => void navigate({ to: '/requests/$requestId', params: { requestId: r.id } })}
              >
                <td className="col-id">{r.id}</td>
                <td className="col-muted">{r.date}</td>
                <td>
                  <div style={{ fontWeight: 500 }}>{getCounterparty(r.unit)?.name}</div>
                  <div className="text-xs muted">{r.coordinator}</div>
                </td>
                <td style={{ maxWidth: 280 }}>{r.items}</td>
                <td>
                  <PriorityTag value={r.priority} />
                </td>
                <td className="col-muted">{r.deadline}</td>
                <td className="col-num">
                  <Money value={r.value} />
                </td>
                <td>
                  <StatusBadge status={r.status} statuses={REQUEST_STATUS_BY_KEY} />
                </td>
                <td>
                  <Icon name="chevron-right" size={14} color="var(--text-faint)" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
