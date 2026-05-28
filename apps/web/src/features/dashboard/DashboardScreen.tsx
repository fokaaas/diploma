import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '../../lib/auth/session'
import { useToast } from '../../context/toast-context'
import { FOUNDATION } from '../../data/foundation'
import { REQUESTS } from '../../data/requests'
import { CONTRIBUTIONS } from '../../data/contributions'
import { PROCUREMENTS } from '../../data/procurements'
import { ITEMS } from '../../data/items'
import { AUDIT } from '../../data/audit'
import { REQUEST_STATUS_BY_KEY } from '../../data/statuses'
import { getCounterparty } from '../../data/queries'
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

function QuickAction({
  icon,
  label,
  onClick,
}: {
  icon: IconName
  label: string
  onClick: () => void
}) {
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

export function DashboardScreen() {
  const { role } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const openRequests = REQUESTS.filter((r) => r.status === 'new' || r.status === 'confirmed').length
  const inProgress = REQUESTS.filter((r) => r.status === 'progress' || r.status === 'partial').length
  const procurementsInProgress = PROCUREMENTS.filter(
    (p) => p.status === 'ordered' || p.status === 'paid',
  ).length
  const lowStockItems = ITEMS.filter((i) => i.warn)
  const lowStock = lowStockItems.length

  const widgets = WIDGETS_BY_ROLE[role ?? 'admin'] ?? WIDGETS_BY_ROLE.admin
  const has = (w: Widget) => widgets.includes(w)

  return (
    <div className="page">
      <PageDashboardHeader
        title={role === 'accountant' ? 'Фінансовий дашборд' : role === 'auditor' ? 'Огляд активності' : 'Дашборд'}
        subtitle={`Сьогодні, 26 травня 2026 · ${FOUNDATION.name}`}
        onExport={() => showToast('Експорт сформовано')}
      />

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
            <div className="stat__value">{openRequests}</div>
            <div className="stat__delta stat__delta--up">+3 за тиждень</div>
          </div>
        )}
        {has('progress') && (
          <div className="stat">
            <div className="stat__label">
              <Icon name="refresh" size={14} />В роботі
            </div>
            <div className="stat__value">{inProgress}</div>
            <div className="stat__sub">2 з них — з критичним пріоритетом</div>
          </div>
        )}
        {has('contrib') && (
          <div className="stat">
            <div className="stat__label">
              <Icon name="contributions" size={14} />
              Внески за травень
            </div>
            <div className="stat__value">
              2,30 <span style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-muted)' }}>млн ₴</span>
            </div>
            <div className="stat__delta stat__delta--up">+18% до квітня</div>
          </div>
        )}
        {has('procurements') && (
          <div className="stat">
            <div className="stat__label">
              <Icon name="procurements" size={14} />
              Закупівлі в роботі
            </div>
            <div className="stat__value">{procurementsInProgress}</div>
            <div className="stat__sub">на суму 1,2 млн ₴</div>
          </div>
        )}
        {has('stock') && (
          <div className="stat">
            <div className="stat__label">
              <Icon name="warehouse" size={14} />
              Низькі залишки
            </div>
            <div className="stat__value">{lowStock}</div>
            <div className="stat__delta stat__delta--warn">потребують поповнення</div>
          </div>
        )}
        {has('contrib-trend') && (
          <div className="stat">
            <div className="stat__label">
              <Icon name="arrow-up" size={14} />
              Динаміка надходжень
            </div>
            <Sparkline values={[120, 180, 145, 210, 198, 245, 230, 312, 268, 290, 348, 410]} height={42} />
            <div className="stat__sub mt-2">12 міс · мак. 410 тис ₴ / тиждень</div>
          </div>
        )}
        {has('audit') && (
          <div className="stat">
            <div className="stat__label">
              <Icon name="audit" size={14} />
              Операцій за період
            </div>
            <div className="stat__value">412</div>
            <div className="stat__sub">журнал змін, ↗ повний доступ</div>
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
                {REQUESTS.slice(0, 5).map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => void navigate({ to: '/requests/$requestId', params: { requestId: r.id } })}
                  >
                    <td className="col-id">{r.id}</td>
                    <td>{getCounterparty(r.unit)?.name.split(' ').slice(0, 3).join(' ')}</td>
                    <td>
                      <StatusBadge status={r.status} statuses={REQUEST_STATUS_BY_KEY} />
                    </td>
                    <td className="col-muted text-right">{r.date}</td>
                  </tr>
                ))}
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
                {CONTRIBUTIONS.slice(0, 5).map((c) => (
                  <tr
                    key={c.id}
                    onClick={() =>
                      void navigate({ to: '/contributions/$contributionId', params: { contributionId: c.id } })
                    }
                  >
                    <td className="col-id">{c.id}</td>
                    <td>{getCounterparty(c.donor)?.name}</td>
                    <td className="col-muted">{c.form === 'monetary' ? 'грошовий' : 'натуральний'}</td>
                    <td className="col-num">
                      <Money value={c.amount} />
                    </td>
                  </tr>
                ))}
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
              {AUDIT.slice(0, 6).map((a, i) => (
                <div key={i} className="timeline__item">
                  <span className={`timeline__dot ${i === 0 ? 'timeline__dot--success' : 'timeline__dot--neutral'}`} />
                  <div className="timeline__title">
                    {a.action} — <span className="mono">{a.entity}</span>
                  </div>
                  <div className="timeline__meta">
                    {a.user} · {a.date}
                  </div>
                  <div className="timeline__body">{a.detail}</div>
                </div>
              ))}
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
            {lowStockItems.map((i) => (
              <div
                key={i.id}
                className="note mb-2"
                style={{ background: 'var(--status-warning-bg)', borderColor: '#e3c79a', color: 'var(--status-warning-fg)' }}
              >
                <Icon name="alert" size={16} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{i.name}</div>
                  <div className="text-xs">
                    Залишок {i.stock} {i.unit} · мінімум {i.minStock} {i.unit} · {i.location}
                  </div>
                </div>
                <button className="btn btn--sm" onClick={() => void navigate({ to: '/procurements/new' })}>
                  Замовити
                </button>
              </div>
            ))}
            {lowStock === 0 && (
              <EmptyState title="Усі позиції в нормі" hint="Поточні запаси перевищують мінімальні рівні" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function PageDashboardHeader({
  title,
  subtitle,
  onExport,
}: {
  title: string
  subtitle: string
  onExport: () => void
}) {
  return (
    <div className="page__header">
      <div>
        <h1 className="page__title">{title}</h1>
        <div className="page__subtitle">{subtitle}</div>
      </div>
      <div className="page__actions">
        <button className="btn">
          <Icon name="calendar" size={15} />
          Травень 2026
        </button>
        <button className="btn" onClick={onExport}>
          <Icon name="download" size={15} />
          Експорт
        </button>
      </div>
    </div>
  )
}
