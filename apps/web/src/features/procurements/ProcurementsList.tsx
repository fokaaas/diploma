import { useMemo, useState } from 'react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useToast } from '../../context/toast-context'
import { useAuth } from '../../lib/auth/session'
import { downloadCsv } from '../../lib/export/csv'
import { PROC_STATUSES, PROC_STATUS_BY_KEY } from '../../data/statuses'
import type { ProcStatus } from '../../types/domain'
import { PageHeader } from '../../components/layout/PageHeader'
import { Icon } from '../../components/ui/Icon'
import { Money } from '../../components/ui/Money'
import { StatusBadge } from '../../components/ui/Badge'
import { FilterDropdown } from '../../components/ui/FilterDropdown'

type StatusFilter = 'all' | ProcStatus

const CAN_MANAGE: Record<string, boolean> = {
  admin: true,
  coordinator: true,
  accountant: true,
}

const routeApi = getRouteApi('/_app/procurements/')

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('uk-UA', { dateStyle: 'medium' })
}

function monthKeyOf(value: string): string {
  const d = new Date(value)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function ProcurementsList() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { user } = useAuth()
  const { procurements } = routeApi.useLoaderData()
  const canManage = CAN_MANAGE[user?.role ?? ''] ?? false

  const [status, setStatus] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [supplier, setSupplier] = useState('all')
  const [request, setRequest] = useState('all')
  const [month, setMonth] = useState('all')

  const supplierOptions = useMemo(() => {
    const set = new Set(procurements.map((p) => p.supplierName))
    return Array.from(set, (name) => ({ value: name, label: name }))
  }, [procurements])

  const requestOptions = useMemo(() => {
    const set = new Set(
      procurements.map((p) => p.requestNumber).filter((n): n is string => n !== null),
    )
    return Array.from(set, (n) => ({ value: n, label: n }))
  }, [procurements])

  const monthOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const p of procurements) {
      const key = monthKeyOf(p.date)
      if (!map.has(key)) {
        map.set(
          key,
          new Date(p.date).toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' }),
        )
      }
    }
    return Array.from(map, ([value, label]) => ({ value, label })).sort((a, b) =>
      b.value.localeCompare(a.value),
    )
  }, [procurements])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return procurements.filter((p) => {
      if (status !== 'all' && p.status !== status) return false
      if (supplier !== 'all' && p.supplierName !== supplier) return false
      if (request !== 'all' && p.requestNumber !== request) return false
      if (month !== 'all' && monthKeyOf(p.date) !== month) return false
      if (
        query &&
        !`${p.number} ${p.supplierName} ${p.itemsSummary}`.toLowerCase().includes(query)
      )
        return false
      return true
    })
  }, [procurements, status, supplier, request, month, search])

  const handleExport = () => {
    try {
      downloadCsv(
        'zakupivli.csv',
        ['№', 'Дата', 'Постачальник', 'Позиції', 'Під заявку', 'Джерело', 'Сума', 'Статус'],
        filtered.map((p) => [
          p.number,
          formatDate(p.date),
          p.supplierName,
          p.itemsSummary,
          p.requestNumber ?? '',
          p.fundingNumbers.join(', '),
          p.totalAmount,
          PROC_STATUS_BY_KEY[p.status].label,
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
        title="Закупівлі та замовлення"
        subtitle="Замовлення у постачальників під заявки фондів"
        actions={
          <>
            <button className="btn" onClick={handleExport}>
              <Icon name="download" size={15} />
              Експорт
            </button>
            {canManage && (
              <button
                className="btn btn--primary"
                onClick={() => void navigate({ to: '/procurements/new' })}
              >
                <Icon name="plus" size={15} />
                Нова закупівля
              </button>
            )}
          </>
        }
      />

      <div className="tabs">
        <button
          className={`tab ${status === 'all' ? 'tab--active' : ''}`}
          onClick={() => setStatus('all')}
        >
          Усі <span className="count">{procurements.length}</span>
        </button>
        {PROC_STATUSES.map((s) => {
          const count = procurements.filter((p) => p.status === s.key).length
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
            <input
              placeholder="Пошук за постачальником, позицією"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <FilterDropdown label="Постачальник" options={supplierOptions} value={supplier} onChange={setSupplier} />
          <FilterDropdown label="Заявка" options={requestOptions} value={request} onChange={setRequest} />
          <FilterDropdown label="Період" options={monthOptions} value={month} onChange={setMonth} />
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
              <th className="col-num">Сума</th>
              <th>Статус</th>
              <th style={{ width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr
                key={p.id}
                onClick={() =>
                  void navigate({
                    to: '/procurements/$procurementId',
                    params: { procurementId: p.id },
                  })
                }
              >
                <td className="col-id">{p.number}</td>
                <td className="col-muted">{formatDate(p.date)}</td>
                <td>{p.supplierName}</td>
                <td style={{ maxWidth: 240 }}>{p.itemsSummary || '—'}</td>
                <td className="col-muted">{p.requestNumber ?? '—'}</td>
                <td className="text-sm muted">
                  {p.fundingNumbers.length > 0 ? p.fundingNumbers.join(', ') : '— (не призначено)'}
                </td>
                <td className="col-num">
                  <Money value={p.totalAmount} />
                </td>
                <td>
                  <StatusBadge status={p.status} statuses={PROC_STATUS_BY_KEY} />
                </td>
                <td>
                  <Icon name="chevron-right" size={14} color="var(--text-faint)" />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr style={{ cursor: 'default' }}>
                <td colSpan={9} className="muted text-center" style={{ padding: 24 }}>
                  Закупівель не знайдено
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
