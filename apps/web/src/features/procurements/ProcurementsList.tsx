import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useToast } from '../../context/toast-context'
import { PROCUREMENTS } from '../../data/procurements'
import { PROC_STATUSES, PROC_STATUS_BY_KEY } from '../../data/statuses'
import { getCounterparty } from '../../data/queries'
import type { ProcStatus } from '../../types/domain'
import { PageHeader } from '../../components/layout/PageHeader'
import { Icon } from '../../components/ui/Icon'
import { Money } from '../../components/ui/Money'
import { StatusBadge } from '../../components/ui/Badge'

type StatusFilter = 'all' | ProcStatus

export function ProcurementsList() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [status, setStatus] = useState<StatusFilter>('all')
  const filtered = PROCUREMENTS.filter((p) => status === 'all' || p.status === status)

  return (
    <div className="page">
      <PageHeader
        title="Закупівлі та замовлення"
        subtitle="Замовлення у постачальників під заявки фондів"
        actions={
          <>
            <button className="btn" onClick={() => showToast('Експорт сформовано')}>
              <Icon name="download" size={15} />
              Експорт
            </button>
            <button className="btn btn--primary" onClick={() => void navigate({ to: '/procurements/new' })}>
              <Icon name="plus" size={15} />
              Нова закупівля
            </button>
          </>
        }
      />

      <div className="tabs">
        <button className={`tab ${status === 'all' ? 'tab--active' : ''}`} onClick={() => setStatus('all')}>
          Усі <span className="count">{PROCUREMENTS.length}</span>
        </button>
        {PROC_STATUSES.map((s) => {
          const count = PROCUREMENTS.filter((p) => p.status === s.key).length
          return (
            <button
              key={s.key}
              className={`tab ${status === s.key ? 'tab--active' : ''}`}
              onClick={() => setStatus(s.key)}
            >
              {s.label} <span className="count">{count}</span>
            </button>
          )
        })}
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="table-search">
            <Icon name="search" size={14} color="var(--text-faint)" />
            <input placeholder="Пошук за постачальником, позицією..." />
          </div>
          <button className="filter-chip">
            <Icon name="filter" size={13} />
            Постачальник
            <span className="filter-chip__caret">▾</span>
          </button>
          <button className="filter-chip">
            <Icon name="filter" size={13} />
            Заявка
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
              <th>Постачальник</th>
              <th>Позиції</th>
              <th>Під заявку</th>
              <th>Джерело</th>
              <th className="text-right">Сума</th>
              <th>Статус</th>
              <th style={{ width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr
                key={p.id}
                onClick={() =>
                  void navigate({ to: '/procurements/$procurementId', params: { procurementId: p.id } })
                }
              >
                <td className="col-id">{p.id}</td>
                <td className="col-muted">{p.date}</td>
                <td>{getCounterparty(p.supplier)?.name}</td>
                <td style={{ maxWidth: 240 }}>{p.lines}</td>
                <td className="col-id">{p.request}</td>
                <td className="text-sm muted">{p.funding.length > 0 ? p.funding.join(', ') : '— (не призначено)'}</td>
                <td className="col-num">
                  <Money value={p.amount} />
                </td>
                <td>
                  <StatusBadge status={p.status} statuses={PROC_STATUS_BY_KEY} />
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
