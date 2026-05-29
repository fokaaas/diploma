import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../../lib/auth/session'
import { REQUEST_STATUS_BY_KEY } from '../../data/statuses'
import { formatCompactUAH, formatMoney } from '../../lib/format'
import { downloadCsv } from '../../lib/export/csv'
import type { DashboardOverview } from '../../lib/api/dashboard'
import { Icon } from '../../components/ui/Icon'
import type { IconName } from '../../components/ui/Icon'
import { Money } from '../../components/ui/Money'
import { StatusBadge } from '../../components/ui/Badge'
import { Sparkline } from '../../components/ui/Sparkline'
import { EmptyState } from '../../components/ui/EmptyState'

type Widget =
  | 'requests'
  | 'progress'
  | 'contrib'
  | 'procurements'
  | 'stock'
  | 'contrib-trend'
  | 'audit'
  | 'recent-requests'
  | 'recent-contribs'
  | 'activity'

const WIDGETS_BY_ROLE: Record<string, Widget[]> = {
  admin: ['requests', 'progress', 'contrib', 'procurements', 'stock', 'activity'],
  coordinator: ['requests', 'progress', 'procurements', 'stock', 'recent-requests', 'activity'],
  accountant: ['contrib', 'contrib-trend', 'recent-contribs', 'procurements', 'activity'],
  auditor: ['requests', 'contrib', 'audit', 'activity'],
}

const EMPTY: DashboardOverview = {
  openRequests: 0,
  openRequestsWeekDelta: 0,
  inProgress: 0,
  inProgressCritical: 0,
  procurementsInProgress: 0,
  procurementsAmount: 0,
  lowStockCount: 0,
  contributionsMonth: 0,
  contributionsDeltaPct: null,
  auditCount: 0,
  trend: [],
  recentRequests: [],
  recentContributions: [],
  lowStockItems: [],
  activity: [],
}

const routeApi = getRouteApi('/_app/')

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function monthLabel(year: number, month1: number): string {
  return new Date(Date.UTC(year, month1 - 1, 1)).toLocaleDateString('uk-UA', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function monthName(month: string): string {
  const [year, m] = month.split('-').map(Number)
  return new Date(Date.UTC(year, m - 1, 1)).toLocaleDateString('uk-UA', {
    month: 'long',
    timeZone: 'UTC',
  })
}

function monthOptions(selected: string): { value: string; label: string }[] {
  const now = new Date()
  const months = new Map<string, string>()
  for (let i = 0; i < 12; i += 1) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
    const value = `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`
    months.set(value, capitalize(monthLabel(date.getUTCFullYear(), date.getUTCMonth() + 1)))
  }
  if (!months.has(selected)) {
    const [year, m] = selected.split('-').map(Number)
    months.set(selected, capitalize(monthLabel(year, m)))
  }
  return [...months.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => (a.value < b.value ? 1 : -1))
}

function todayLabel(): string {
  return new Date().toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function activityTime(iso: string): string {
  const date = new Date(iso)
  const day = date.toLocaleDateString('uk-UA', { day: '2-digit', month: 'short', year: 'numeric' })
  const time = date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
  return `${day} · ${time}`
}

function QuickAction({ icon, label, onClick }: { icon: IconName; label: string; onClick: () => void }) {
  return (
    <button
      className="btn"
      onClick={onClick}
      style={{
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '14px 16px',
        textAlign: 'left',
        flex: 1,
        height: 'auto',
      }}
    >
      <Icon name={icon} size={20} color="var(--olive-600)" />
      <span style={{ marginTop: 8, fontWeight: 500 }}>{label}</span>
    </button>
  )
}

export function DashboardScreen({ month }: { month: string }) {
  const { role, foundationName } = useAuth()
  const navigate = useNavigate()
  const { overview } = routeApi.useLoaderData()
  const data = overview ?? EMPTY

  const widgets = WIDGETS_BY_ROLE[role ?? 'admin'] ?? WIDGETS_BY_ROLE.admin
  const has = (w: Widget) => widgets.includes(w)
  const showPicker = has('contrib') || has('audit')
  const trendMax = data.trend.reduce((max, point) => Math.max(max, point.total), 0)

  const handleExport = () => {
    downloadCsv('dashboard.csv', ['Показник', 'Значення'], [
      ['Відкритих заявок', data.openRequests],
      ['Нових за тиждень', data.openRequestsWeekDelta],
      ['В роботі', data.inProgress],
      ['З критичним пріоритетом', data.inProgressCritical],
      [`Внески за ${monthName(month)}`, formatMoney(data.contributionsMonth)],
      ['Зміна до попереднього місяця, %', data.contributionsDeltaPct ?? '—'],
      ['Закупівлі в роботі', data.procurementsInProgress],
      ['Сума закупівель в роботі', formatMoney(data.procurementsAmount)],
      ['Низькі залишки', data.lowStockCount],
      ['Операцій за період', data.auditCount],
    ])
  }

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">
            {role === 'accountant' ? 'Фінансовий дашборд' : role === 'auditor' ? 'Огляд активності' : 'Дашборд'}
          </h1>
          <div className="page__subtitle">
            Сьогодні, {todayLabel()}
            {foundationName ? ` · ${foundationName}` : ''}
          </div>
        </div>
        <div className="page__actions">
          {showPicker && (
            <select
              className="select"
              value={month}
              onChange={(e) => void navigate({ to: '/', search: { month: e.target.value } })}
            >
              {monthOptions(month).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
          <button className="btn" onClick={handleExport}>
            <Icon name="download" size={15} />
            Експорт
          </button>
        </div>
      </div>

      {role !== 'auditor' && (
        <>
          <div className="section-title" style={{ marginTop: 4 }}>
            Швидкі дії
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 22 }}>
            {(role === 'coordinator' || role === 'admin') && (
              <QuickAction icon="requests" label="Нова заявка" onClick={() => void navigate({ to: '/requests/new' })} />
            )}
            {(role === 'accountant' || role === 'admin') && (
              <QuickAction
                icon="contributions"
                label="Зареєструвати внесок"
                onClick={() => void navigate({ to: '/contributions/new' })}
              />
            )}
            {(role === 'coordinator' || role === 'admin') && (
              <QuickAction
                icon="procurements"
                label="Нова закупівля"
                onClick={() => void navigate({ to: '/procurements/new' })}
              />
            )}
            {(role === 'coordinator' || role === 'admin') && (
              <QuickAction
                icon="warehouse"
                label="Видача зі складу"
                onClick={() => void navigate({ to: '/warehouse', search: { issue: true } })}
              />
            )}
          </div>
        </>
      )}

      <div className="stat-grid">
        {has('requests') && (
          <div className="stat">
            <div className="stat__label">
              <Icon name="requests" size={14} />
              Відкритих заявок
            </div>
            <div className="stat__value">{data.openRequests}</div>
            <div className="stat__delta stat__delta--up">+{data.openRequestsWeekDelta} за тиждень</div>
          </div>
        )}
        {has('progress') && (
          <div className="stat">
            <div className="stat__label">
              <Icon name="refresh" size={14} />В роботі
            </div>
            <div className="stat__value">{data.inProgress}</div>
            <div className="stat__sub">{data.inProgressCritical} з них — з критичним пріоритетом</div>
          </div>
        )}
        {has('contrib') && (
          <div className="stat">
            <div className="stat__label">
              <Icon name="contributions" size={14} />
              Внески за {monthName(month)}
            </div>
            <div className="stat__value">{formatCompactUAH(data.contributionsMonth)}</div>
            {data.contributionsDeltaPct !== null && (
              <div
                className={`stat__delta ${data.contributionsDeltaPct >= 0 ? 'stat__delta--up' : 'stat__delta--warn'}`}
              >
                {data.contributionsDeltaPct >= 0 ? '+' : ''}
                {data.contributionsDeltaPct}% до попереднього місяця
              </div>
            )}
          </div>
        )}
        {has('procurements') && (
          <div className="stat">
            <div className="stat__label">
              <Icon name="procurements" size={14} />
              Закупівлі в роботі
            </div>
            <div className="stat__value">{data.procurementsInProgress}</div>
            <div className="stat__sub">на суму {formatCompactUAH(data.procurementsAmount)}</div>
          </div>
        )}
        {has('stock') && (
          <div className="stat">
            <div className="stat__label">
              <Icon name="warehouse" size={14} />
              Низькі залишки
            </div>
            <div className="stat__value">{data.lowStockCount}</div>
            <div className="stat__delta stat__delta--warn">потребують поповнення</div>
          </div>
        )}
        {has('contrib-trend') && (
          <div className="stat">
            <div className="stat__label">
              <Icon name="arrow-up" size={14} />
              Динаміка надходжень
            </div>
            <Sparkline values={data.trend.length ? data.trend.map((t) => t.total) : [0, 0]} height={42} />
            <div className="stat__sub mt-2">12 міс · мак. {formatCompactUAH(trendMax)}</div>
          </div>
        )}
        {has('audit') && (
          <div className="stat">
            <div className="stat__label">
              <Icon name="audit" size={14} />
              Операцій за період
            </div>
            <div className="stat__value">{data.auditCount}</div>
            <div className="stat__sub">журнал змін за {monthName(month)}</div>
          </div>
        )}
      </div>

      <div className="grid-2">
        {has('recent-requests') && (
          <div className="card">
            <div className="card__header">
              <h3 className="card__title">Останні заявки</h3>
              <button className="btn btn--ghost btn--sm" onClick={() => void navigate({ to: '/requests' })}>
                Усі <Icon name="arrow-right" size={14} />
              </button>
            </div>
            <table className="data">
              <tbody>
                {data.recentRequests.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => void navigate({ to: '/requests/$requestId', params: { requestId: r.id } })}
                  >
                    <td className="col-id">{r.number}</td>
                    <td>{r.unitName.split(' ').slice(0, 3).join(' ')}</td>
                    <td>
                      <StatusBadge status={r.status} statuses={REQUEST_STATUS_BY_KEY} />
                    </td>
                    <td className="col-muted text-right">
                      {new Date(r.occurredAt).toLocaleDateString('uk-UA', { dateStyle: 'medium' })}
                    </td>
                  </tr>
                ))}
                {data.recentRequests.length === 0 && (
                  <tr style={{ cursor: 'default' }}>
                    <td className="muted">Заявок ще немає</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {has('recent-contribs') && (
          <div className="card">
            <div className="card__header">
              <h3 className="card__title">Останні надходження</h3>
              <button className="btn btn--ghost btn--sm" onClick={() => void navigate({ to: '/contributions' })}>
                Усі <Icon name="arrow-right" size={14} />
              </button>
            </div>
            <table className="data">
              <tbody>
                {data.recentContributions.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => void navigate({ to: '/contributions/$contributionId', params: { contributionId: c.id } })}
                  >
                    <td className="col-id">{c.number}</td>
                    <td>{c.donorName}</td>
                    <td className="col-muted">{c.form === 'monetary' ? 'грошовий' : 'натуральний'}</td>
                    <td className="col-num">
                      <Money value={c.amount} />
                    </td>
                  </tr>
                ))}
                {data.recentContributions.length === 0 && (
                  <tr style={{ cursor: 'default' }}>
                    <td className="muted">Надходжень ще немає</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="card">
          <div className="card__header">
            <h3 className="card__title">Стрічка активності</h3>
            <button className="btn btn--ghost btn--sm" onClick={() => void navigate({ to: '/audit' })}>
              Весь журнал <Icon name="arrow-right" size={14} />
            </button>
          </div>
          <div className="card__body" style={{ paddingTop: 8 }}>
            <div className="timeline">
              {data.activity.map((a, i) => (
                <div key={a.id} className="timeline__item">
                  <span className={`timeline__dot ${i === 0 ? 'timeline__dot--success' : 'timeline__dot--neutral'}`} />
                  <div className="timeline__title">
                    {a.action}
                    {a.targetRef ? (
                      <>
                        {' '}
                        — <span className="mono">{a.targetRef}</span>
                      </>
                    ) : null}
                  </div>
                  <div className="timeline__meta">
                    {a.actorName} · {activityTime(a.occurredAt)}
                  </div>
                  <div className="timeline__body">{a.summary}</div>
                </div>
              ))}
              {data.activity.length === 0 && (
                <EmptyState title="Журнал порожній" hint="Тут зʼявляться останні дії у фонді" />
              )}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card__header">
            <h3 className="card__title">Попередження по складу</h3>
            <button className="btn btn--ghost btn--sm" onClick={() => void navigate({ to: '/warehouse' })}>
              Перейти на склад <Icon name="arrow-right" size={14} />
            </button>
          </div>
          <div className="card__body">
            {data.lowStockItems.map((i) => (
              <div
                key={`${i.itemId}-${i.warehouseName}`}
                className="note mb-2"
                style={{ background: 'var(--status-warning-bg)', borderColor: '#e3c79a', color: 'var(--status-warning-fg)' }}
              >
                <Icon name="alert" size={16} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{i.name}</div>
                  <div className="text-xs">
                    Залишок {i.quantity} {i.unit} · мінімум {i.minStock} {i.unit} · {i.warehouseName}
                  </div>
                </div>
                <button className="btn btn--sm" onClick={() => void navigate({ to: '/procurements/new' })}>
                  Замовити
                </button>
              </div>
            ))}
            {data.lowStockItems.length === 0 && (
              <EmptyState title="Усі позиції в нормі" hint="Поточні запаси перевищують мінімальні рівні" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
