import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useToast } from '../../context/toast-context'
import { getCounterparty, getRequest, listProcurementsForRequest } from '../../data/queries'
import { REQUESTS } from '../../data/requests'
import { REQUEST_LIFECYCLE, PROC_STATUS_BY_KEY, REQUEST_STATUS_BY_KEY } from '../../data/statuses'
import { formatNumber } from '../../lib/format'
import { PageHeader } from '../../components/layout/PageHeader'
import { Icon } from '../../components/ui/Icon'
import { Money } from '../../components/ui/Money'
import { PriorityTag } from '../../components/ui/PriorityTag'
import { StatusBadge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { initialsOf } from '../../lib/initials'
import { Lifecycle } from '../../components/ui/Lifecycle'
import { EntityLink } from '../../components/ui/EntityLink'
import { RelationshipGraph } from '../graph/RelationshipGraph'

const LINES = [
  { name: 'FPV-дрон 7", аналогова система', sku: 'DRN-FPV-7', qty: 40, unit: 'шт', spec: 'Частота 1.2 ГГц, дальність 10 км, з GPS', received: 0 },
  { name: 'Акумулятор LiPo 6S 1300mAh', sku: 'DRN-BAT', qty: 120, unit: 'шт', spec: "120C, balance-роз'єм XT60", received: 0 },
]

const HISTORY = [
  { d: '26 трав. 2026 · 12:08', u: 'Олена Гриценко', t: 'Створення заявки', body: 'Заявка зареєстрована та надіслана на підтвердження.', cls: '' },
  { d: '26 трав. 2026 · 12:18', u: 'Анастасія Левченко', t: 'Підтвердження', body: 'Статус → Підтверджена. Виконавець: Дмитро Кравчук.', cls: '' },
  { d: '26 трав. 2026 · 09:11', u: 'Дмитро Кравчук', t: 'Створено закупівлю PR-2026-0301', body: 'ТОВ «Дрон-Технолоджис» — FPV-дрон 7" ×40.', cls: '' },
  { d: '26 трав. 2026 · 14:00', u: 'Дмитро Кравчук', t: 'Статус → В роботі', body: 'Розпочато виконання заявки.', cls: '--success' },
]

const ATTACHMENTS = ['Фото потреби 1.jpg', 'Фото потреби 2.jpg', 'Тех_завдання_FPV.pdf', 'Голосове повідомлення.ogg']

export function RequestCard({ id }: { id: string }) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [graphOpen, setGraphOpen] = useState(false)

  const request = getRequest(id) ?? REQUESTS[0]
  const unit = getCounterparty(request.unit)
  const linkedProcurements = listProcurementsForRequest(request.id)

  return (
    <div className="page">
      <PageHeader
        breadcrumb={[{ label: 'Заявки', onClick: () => void navigate({ to: '/requests' }) }, { label: request.id }]}
        title={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
            <span className="mono" style={{ fontSize: 'var(--fs-2xl)' }}>
              {request.id}
            </span>
            <StatusBadge status={request.status} statuses={REQUEST_STATUS_BY_KEY} />
            <PriorityTag value={request.priority} />
          </span>
        }
        subtitle={`Зареєстрована ${request.date} · ${unit?.name ?? ''}`}
        actions={
          <>
            <button className="btn" onClick={() => setGraphOpen(true)}>
              <Icon name="link" size={15} />
              Граф зв'язків
            </button>
            <button className="btn" onClick={() => showToast('Редагування заявки незабаром')}>
              <Icon name="edit" size={15} />
              Редагувати
            </button>
            <button className="btn btn--primary" onClick={() => showToast('Статус заявки змінено')}>
              <Icon name="check" size={15} />
              Змінити статус
            </button>
          </>
        }
      />

      <Lifecycle steps={REQUEST_LIFECYCLE} current={request.status} byKey={REQUEST_STATUS_BY_KEY} />

      <div className="detail-grid">
        <div>
          <div className="card mb-4">
            <div className="card__header">
              <h3 className="card__title">Позиції до забезпечення</h3>
              <span className="muted text-sm">
                {LINES.length} рядки · сума {formatNumber(request.value)} ₴
              </span>
            </div>
            <table className="data">
              <thead>
                <tr>
                  <th>Позиція</th>
                  <th>SKU</th>
                  <th style={{ width: 90 }}>К-сть</th>
                  <th style={{ width: 110 }}>Видано</th>
                  <th>Технічна вимога</th>
                </tr>
              </thead>
              <tbody>
                {LINES.map((l) => (
                  <tr key={l.sku} style={{ cursor: 'default' }}>
                    <td style={{ fontWeight: 500 }}>{l.name}</td>
                    <td className="mono text-sm muted">{l.sku}</td>
                    <td className="col-num">
                      {l.qty} {l.unit}
                    </td>
                    <td className="col-num">
                      <span className="muted">
                        {l.received} / {l.qty}
                      </span>
                    </td>
                    <td className="text-sm muted">{l.spec}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card mb-4">
            <div className="card__header">
              <h3 className="card__title">Пов'язані операції</h3>
              <button className="btn btn--sm btn--ghost" onClick={() => setGraphOpen(true)}>
                Граф <Icon name="arrow-right" size={13} />
              </button>
            </div>
            <div className="card__body">
              <div className="muted text-sm mb-2">Закупівлі ({linkedProcurements.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {linkedProcurements.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '8px 10px',
                      background: 'var(--surface-2)',
                      borderRadius: 'var(--radius)',
                    }}
                  >
                    <EntityLink to="/procurements/$procurementId" params={{ procurementId: p.id }}>
                      {p.id}
                    </EntityLink>
                    <span>{getCounterparty(p.supplier)?.name}</span>
                    <StatusBadge status={p.status} statuses={PROC_STATUS_BY_KEY} />
                    <span className="muted text-sm" style={{ marginLeft: 'auto' }}>
                      {p.lines}
                    </span>
                    <span className="tabular">
                      <Money value={p.amount} />
                    </span>
                  </div>
                ))}
                {linkedProcurements.length === 0 && <div className="muted text-sm">Поки що немає</div>}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <h3 className="card__title">Історія змін</h3>
            </div>
            <div className="card__body">
              <div className="timeline">
                {HISTORY.map((it, i) => (
                  <div key={i} className="timeline__item">
                    <span className={`timeline__dot timeline__dot${it.cls}`} />
                    <div className="timeline__title">{it.t}</div>
                    <div className="timeline__meta">
                      {it.u} · {it.d}
                    </div>
                    <div className="timeline__body">{it.body}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="card mb-4">
            <div className="card__header">
              <h3 className="card__title">Деталі</h3>
            </div>
            <div className="card__body">
              <dl className="kv">
                <dt>Підрозділ</dt>
                <dd>
                  <strong>{unit?.name}</strong>
                  <div className="text-xs muted">{unit?.note}</div>
                </dd>
                <dt>Координатор</dt>
                <dd>
                  {request.coordinator}
                  <div className="text-xs muted">{unit?.phone}</div>
                </dd>
                <dt>Канал зв'язку</dt>
                <dd>{unit?.channel}</dd>
                <dt>Зареєстрував</dt>
                <dd>Олена Гриценко</dd>
                <dt>Виконавець</dt>
                <dd>Дмитро Кравчук</dd>
                <dt>Дедлайн</dt>
                <dd>{request.deadline}</dd>
                <dt>Пріоритет</dt>
                <dd>
                  <PriorityTag value={request.priority} />
                </dd>
              </dl>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card__header">
              <h3 className="card__title">Вкладення</h3>
              <span className="muted text-sm">{request.attachments}</span>
            </div>
            <div className="card__body">
              {ATTACHMENTS.slice(0, request.attachments).map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '7px 0',
                    borderBottom: i < request.attachments - 1 ? '1px solid var(--border-soft)' : 0,
                  }}
                >
                  <Icon name="paperclip" size={15} color="var(--text-muted)" />
                  <span className="text-sm" style={{ flex: 1 }}>
                    {f}
                  </span>
                  <Icon name="download" size={14} color="var(--text-muted)" />
                </div>
              ))}
              {request.attachments === 0 && <div className="muted text-sm">Без вкладень</div>}
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <h3 className="card__title">Контакт підрозділу</h3>
            </div>
            <div className="card__body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Avatar
                  initials={request.coordinator.split(' ').slice(-2).map((s) => s[0]).join('')}
                  size="md"
                  color="var(--olive-400)"
                />
                <div>
                  <div style={{ fontWeight: 500 }}>{request.coordinator}</div>
                  <div className="text-xs muted">
                    {unit?.channel} · {unit?.phone}
                  </div>
                </div>
              </div>
              <button className="btn w-full" onClick={() => showToast(`Звʼязок: ${initialsOf(request.coordinator)}`)}>
                <Icon name="phone" size={15} />
                Зв'язатися
              </button>
            </div>
          </div>
        </div>
      </div>

      {graphOpen && <RelationshipGraph rootId={request.id} onClose={() => setGraphOpen(false)} />}
    </div>
  )
}
