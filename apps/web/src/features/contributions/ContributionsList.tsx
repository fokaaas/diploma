import { useMemo, useState } from 'react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useToast } from '../../context/toast-context'
import { useAuth } from '../../lib/auth/session'
import { downloadCsv } from '../../lib/export/csv'
import { formatCompactUAH, formatNumber } from '../../lib/format'
import type { ContributionForm } from '../../types/domain'
import type { ContributionListItem } from '../../lib/api/contributions'
import { PageHeader } from '../../components/layout/PageHeader'
import { Icon } from '../../components/ui/Icon'
import { Money } from '../../components/ui/Money'
import { FilterDropdown } from '../../components/ui/FilterDropdown'

type FormFilter = 'all' | ContributionForm

const CAN_MANAGE: Record<string, boolean> = { admin: true, accountant: true }
const FORM_LABEL: Record<ContributionForm, string> = {
  monetary: 'грошовий',
  'in-kind': 'натуральний',
}

const routeApi = getRouteApi('/_app/contributions/')

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('uk-UA', { dateStyle: 'medium' })
}

function monthKeyOf(value: string): string {
  const d = new Date(value)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function sumAmount(rows: ContributionListItem[]): number {
  return rows.reduce((sum, c) => sum + c.amount, 0)
}

export function ContributionsList() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { user } = useAuth()
  const { contributions } = routeApi.useLoaderData()
  const canManage = CAN_MANAGE[user?.role ?? ''] ?? false

  const [formTab, setFormTab] = useState<FormFilter>('all')
  const [search, setSearch] = useState('')
  const [donor, setDonor] = useState('all')
  const [month, setMonth] = useState('all')

  const donorOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const c of contributions) if (!map.has(c.donorId)) map.set(c.donorId, c.donorName)
    return Array.from(map, ([value, label]) => ({ value, label }))
  }, [contributions])

  const monthOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const c of contributions) {
      const key = monthKeyOf(c.date)
      if (!map.has(key)) {
        map.set(
          key,
          new Date(c.date).toLocaleDateString('uk-UA', {
            month: 'long',
            year: 'numeric',
          }),
        )
      }
    }
    return Array.from(map, ([value, label]) => ({ value, label })).sort((a, b) =>
      b.value.localeCompare(a.value),
    )
  }, [contributions])

  const periodSet = useMemo(
    () => (month === 'all' ? contributions : contributions.filter((c) => monthKeyOf(c.date) === month)),
    [contributions, month],
  )

  const stats = useMemo(() => {
    const monetary = periodSet.filter((c) => c.form === 'monetary')
    const inKind = periodSet.filter((c) => c.form === 'in-kind')
    const allTotal = sumAmount(contributions)
    const allocated = contributions.reduce((s, c) => s + c.allocatedTotal, 0)
    let delta: number | null = null
    if (month !== 'all') {
      const [y, m] = month.split('-').map(Number)
      const prev = new Date(y, m - 2, 1)
      const prevKey = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`
      const prevTotal = sumAmount(contributions.filter((c) => monthKeyOf(c.date) === prevKey))
      if (prevTotal > 0) delta = Math.round(((sumAmount(periodSet) - prevTotal) / prevTotal) * 100)
    }
    return {
      total: sumAmount(periodSet),
      delta,
      monetaryTotal: sumAmount(monetary),
      monetaryCount: monetary.length,
      inKindTotal: sumAmount(inKind),
      inKindCount: inKind.length,
      unspent: Math.max(0, allTotal - allocated),
    }
  }, [contributions, periodSet, month])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return periodSet.filter((c) => {
      if (formTab !== 'all' && c.form !== formTab) return false
      if (donor !== 'all' && c.donorId !== donor) return false
      if (
        query &&
        !`${c.number} ${c.donorName} ${c.purpose ?? ''} ${c.baseDocumentLabel ?? ''}`
          .toLowerCase()
          .includes(query)
      )
        return false
      return true
    })
  }, [periodSet, formTab, donor, search])

  const handleExport = () => {
    try {
      downloadCsv(
        'vnesky.csv',
        ['№', 'Дата', 'Донор', 'Форма', 'Призначення', 'Документ', 'Закупівлі', 'Сума'],
        filtered.map((c) => [
          c.number,
          formatDate(c.date),
          c.donorName,
          FORM_LABEL[c.form],
          c.purpose,
          c.baseDocumentLabel,
          c.procurementCount,
          c.amount,
        ]),
      )
      showToast('Експорт у бухгалтерію сформовано')
    } catch {
      showToast('Не вдалося сформувати експорт')
    }
  }

  const formCount = (form: ContributionForm) =>
    contributions.filter((c) => c.form === form).length

  return (
    <div className="page">
      <PageHeader
        title="Благодійні внески"
        subtitle="Облік грошових та натуральних надходжень фонду"
        actions={
          <>
            <button className="btn" onClick={handleExport}>
              <Icon name="download" size={15} />
              Експорт у бухгалтерію
            </button>
            {canManage && (
              <button
                className="btn btn--primary"
                onClick={() => void navigate({ to: '/contributions/new' })}
              >
                <Icon name="plus" size={15} />
                Зареєструвати внесок
              </button>
            )}
          </>
        }
      />

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat">
          <div className="stat__label">Усього за період</div>
          <div className="stat__value">{formatCompactUAH(stats.total)}</div>
          {stats.delta !== null && (
            <div className={`stat__delta ${stats.delta >= 0 ? 'stat__delta--up' : 'stat__delta--down'}`}>
              {stats.delta >= 0 ? '+' : ''}
              {stats.delta}% м/м
            </div>
          )}
        </div>
        <div className="stat">
          <div className="stat__label">Грошових</div>
          <div className="stat__value">{formatCompactUAH(stats.monetaryTotal)}</div>
          <div className="stat__sub">{stats.monetaryCount} надходжень</div>
        </div>
        <div className="stat">
          <div className="stat__label">Натуральних</div>
          <div className="stat__value">{formatCompactUAH(stats.inKindTotal)}</div>
          <div className="stat__sub">{stats.inKindCount} надходжень · оцінка</div>
        </div>
        <div className="stat">
          <div className="stat__label">Залишок невитрачених</div>
          <div className="stat__value">{formatCompactUAH(stats.unspent)}</div>
          <div className="stat__sub">в очікуванні закупівель</div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${formTab === 'all' ? 'tab--active' : ''}`} onClick={() => setFormTab('all')}>
          Усі <span className="count">{contributions.length}</span>
        </button>
        <button className={`tab ${formTab === 'monetary' ? 'tab--active' : ''}`} onClick={() => setFormTab('monetary')}>
          Грошові <span className="count">{formCount('monetary')}</span>
        </button>
        <button className={`tab ${formTab === 'in-kind' ? 'tab--active' : ''}`} onClick={() => setFormTab('in-kind')}>
          Натуральні <span className="count">{formCount('in-kind')}</span>
        </button>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="table-search">
            <Icon name="search" size={14} color="var(--text-faint)" />
            <input
              placeholder="Пошук за донором, призначенням, документом..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <FilterDropdown label="Донор" options={donorOptions} value={donor} onChange={setDonor} />
          <FilterDropdown label="Період" options={monthOptions} value={month} onChange={setMonth} />
          <div style={{ marginLeft: 'auto' }} className="muted text-sm tabular">
            Сума: <strong>{formatNumber(sumAmount(filtered))} ₴</strong>
          </div>
        </div>
        <table className="data">
          <thead>
            <tr>
              <th>№</th>
              <th>Дата</th>
              <th>Донор</th>
              <th>Форма</th>
              <th>Призначення</th>
              <th>Документ</th>
              <th>Закупівлі</th>
              <th className="text-right">Сума</th>
              <th style={{ width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr
                key={c.id}
                onClick={() =>
                  void navigate({
                    to: '/contributions/$contributionId',
                    params: { contributionId: c.id },
                  })
                }
              >
                <td className="col-id">{c.number}</td>
                <td className="col-muted">{formatDate(c.date)}</td>
                <td>{c.donorName}</td>
                <td>
                  {c.form === 'monetary' ? (
                    <span className="badge badge--success">грошовий</span>
                  ) : (
                    <span className="badge badge--violet">натуральний</span>
                  )}
                </td>
                <td>{c.purpose ?? '—'}</td>
                <td className="text-sm muted">{c.baseDocumentLabel ?? '—'}</td>
                <td className="col-muted">
                  {c.procurementCount > 0 ? `${c.procurementCount} зак.` : '—'}
                </td>
                <td className="col-num">
                  <Money value={c.amount} />
                </td>
                <td>
                  <Icon name="chevron-right" size={14} color="var(--text-faint)" />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr style={{ cursor: 'default' }}>
                <td colSpan={9} className="muted text-center" style={{ padding: 24 }}>
                  Внесків не знайдено
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
