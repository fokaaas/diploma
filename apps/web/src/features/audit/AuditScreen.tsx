import { useMemo, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { PageHeader } from '../../components/layout/PageHeader'
import { Icon } from '../../components/ui/Icon'
import { Avatar } from '../../components/ui/Avatar'
import { EntityLink } from '../../components/ui/EntityLink'
import { FilterDropdown, type FilterOption } from '../../components/ui/FilterDropdown'
import { initialsOf } from '../../lib/initials'
import { downloadCsv } from '../../lib/export/csv'
import type { AuditEntry } from '../../lib/api/audit'

const routeApi = getRouteApi('/_app/audit')

function formatDateTime(iso: string): string {
  const date = new Date(iso)
  const day = date.toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  const time = date.toLocaleTimeString('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${day} · ${time}`
}

function monthKey(iso: string): string {
  return iso.slice(0, 7)
}

function monthLabel(key: string): string {
  const [year, month] = key.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('uk-UA', {
    month: 'long',
    year: 'numeric',
  })
}

function distinctOptions(values: string[]): FilterOption[] {
  return [...new Set(values)].map((value) => ({ value, label: value }))
}

function EntityCell({ entry }: { entry: AuditEntry }) {
  const { targetType, targetId, targetRef } = entry
  if (!targetRef) return <span className="muted">—</span>
  if (targetType === 'REQUEST')
    return (
      <EntityLink to="/requests/$requestId" params={{ requestId: targetId }}>
        {targetRef}
      </EntityLink>
    )
  if (targetType === 'CONTRIBUTION')
    return (
      <EntityLink
        to="/contributions/$contributionId"
        params={{ contributionId: targetId }}
      >
        {targetRef}
      </EntityLink>
    )
  if (targetType === 'PROCUREMENT')
    return (
      <EntityLink
        to="/procurements/$procurementId"
        params={{ procurementId: targetId }}
      >
        {targetRef}
      </EntityLink>
    )
  return <span className="entity-link">{targetRef}</span>
}

export function AuditScreen() {
  const { entries } = routeApi.useLoaderData()

  const [search, setSearch] = useState('')
  const [action, setAction] = useState('all')
  const [actor, setActor] = useState('all')
  const [period, setPeriod] = useState('all')

  const actionOptions = useMemo(
    () => distinctOptions(entries.map((e) => e.action)),
    [entries],
  )
  const actorOptions = useMemo(
    () => distinctOptions(entries.map((e) => e.actorName)),
    [entries],
  )
  const periodOptions = useMemo(
    () =>
      [...new Set(entries.map((e) => monthKey(e.occurredAt)))].map((key) => ({
        value: key,
        label: monthLabel(key),
      })),
    [entries],
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return entries.filter((entry) => {
      if (action !== 'all' && entry.action !== action) return false
      if (actor !== 'all' && entry.actorName !== actor) return false
      if (period !== 'all' && monthKey(entry.occurredAt) !== period) return false
      if (!query) return true
      const haystack = [
        entry.actorName,
        entry.action,
        entry.targetRef ?? '',
        entry.summary,
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(query)
    })
  }, [entries, search, action, actor, period])

  const handleExport = () => {
    downloadCsv(
      'audit-log.csv',
      ['Дата і час', 'Користувач', 'Дія', 'Сутність', 'Деталі'],
      filtered.map((entry) => [
        formatDateTime(entry.occurredAt),
        entry.actorName,
        entry.action,
        entry.targetRef ?? '',
        entry.summary,
      ]),
    )
  }

  return (
    <div className="page">
      <PageHeader
        title="Аудит та історія операцій"
        subtitle="Read-only журнал усіх змін у системі"
        actions={
          <button className="btn" onClick={handleExport} disabled={filtered.length === 0}>
            <Icon name="download" size={15} />
            Експорт журналу
          </button>
        }
      />

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="table-search">
            <Icon name="search" size={14} color="var(--text-faint)" />
            <input
              placeholder="Пошук за сутністю, користувачем, дією..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <FilterDropdown label="Дія" options={actionOptions} value={action} onChange={setAction} />
          <FilterDropdown label="Користувач" options={actorOptions} value={actor} onChange={setActor} />
          <FilterDropdown label="Період" options={periodOptions} value={period} onChange={setPeriod} />
          <span className="muted text-sm" style={{ marginLeft: 'auto' }}>
            Знайдено: {filtered.length}
          </span>
        </div>
        <table className="data">
          <thead>
            <tr>
              <th style={{ width: 180 }}>Дата і час</th>
              <th>Користувач</th>
              <th>Дія</th>
              <th>Сутність</th>
              <th>Деталі</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => (
              <tr key={entry.id} style={{ cursor: 'default' }}>
                <td className="col-muted">{formatDateTime(entry.occurredAt)}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar initials={initialsOf(entry.actorName)} color="var(--olive-300)" />
                    <span>{entry.actorName}</span>
                  </div>
                </td>
                <td>{entry.action}</td>
                <td>
                  <EntityCell entry={entry} />
                </td>
                <td className="text-sm muted">{entry.summary}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr style={{ cursor: 'default' }}>
                <td colSpan={5} className="muted text-center" style={{ padding: 24 }}>
                  Записів не знайдено
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
