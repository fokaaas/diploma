import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useToast } from '../../context/toast-context'
import { PROCUREMENTS } from '../../data/procurements'
import { PROC_LIFECYCLE, PROC_STATUS_BY_KEY } from '../../data/statuses'
import { getCounterparty, getProcurement } from '../../data/queries'
import { formatNumber } from '../../lib/format'
import { PageHeader } from '../../components/layout/PageHeader'
import { Icon } from '../../components/ui/Icon'
import { Money } from '../../components/ui/Money'
import { StatusBadge } from '../../components/ui/Badge'
import { Lifecycle } from '../../components/ui/Lifecycle'
import { EntityLink } from '../../components/ui/EntityLink'
import { ProcurementReceiveModal } from './ProcurementReceiveModal'

const DOCUMENTS = [
  { name: 'Рахунок №2026-04127.pdf', sub: 'Виставлено 25 трав. 2026', muted: false },
  { name: 'Платіжне доручення №87.pdf', sub: 'Підписано 25 трав. 2026', muted: false },
  { name: 'Видаткова накладна.pdf', sub: 'Ще не отримана', muted: true },
  { name: 'Акт прийому-передачі.pdf', sub: 'Ще не отриманий', muted: true },
]

export function ProcurementCard({ id }: { id: string }) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [receiveOpen, setReceiveOpen] = useState(false)

  const procurement = getProcurement(id) ?? PROCUREMENTS[0]
  const supplier = getCounterparty(procurement.supplier)
  const canReceive = procurement.status === 'paid' || procurement.status === 'ordered'

  return (
    <div className="page">
      <PageHeader
        breadcrumb={[
          { label: 'Закупівлі', onClick: () => void navigate({ to: '/procurements' }) },
          { label: procurement.id },
        ]}
        title={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
            <span className="mono" style={{ fontSize: 'var(--fs-2xl)' }}>
              {procurement.id}
            </span>
            <StatusBadge status={procurement.status} statuses={PROC_STATUS_BY_KEY} />
          </span>
        }
        subtitle={`${procurement.date} · ${supplier?.name ?? ''}`}
        actions={
          <>
            <button className="btn" onClick={() => showToast('Редагування закупівлі незабаром')}>
              <Icon name="edit" size={15} />
              Редагувати
            </button>
            {canReceive && (
              <button className="btn btn--primary" onClick={() => setReceiveOpen(true)}>
                <Icon name="box" size={15} />
                Прийняти на склад
              </button>
            )}
            {procurement.status === 'received' && (
              <button className="btn btn--primary" onClick={() => showToast('Закупівлю закрито')}>
                <Icon name="check" size={15} />
                Закрити закупівлю
              </button>
            )}
          </>
        }
      />

      <Lifecycle steps={PROC_LIFECYCLE} current={procurement.status} byKey={PROC_STATUS_BY_KEY} />

      <div className="detail-grid">
        <div>
          <div className="card mb-4">
            <div className="card__header">
              <h3 className="card__title">Специфікація</h3>
            </div>
            <table className="data">
              <thead>
                <tr>
                  <th>Позиція</th>
                  <th>SKU</th>
                  <th>К-сть</th>
                  <th>Ціна</th>
                  <th className="text-right">Сума</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ cursor: 'default' }}>
                  <td>FPV-дрон 7", аналогова</td>
                  <td className="mono">DRN-FPV-7</td>
                  <td className="col-num">40 шт</td>
                  <td className="col-num">14 800 ₴</td>
                  <td className="col-num">
                    <Money value={592000} />
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr style={{ cursor: 'default' }}>
                  <td colSpan={4} className="text-right muted">
                    Усього без ПДВ
                  </td>
                  <td className="col-num">
                    <strong>
                      <Money value={procurement.amount} />
                    </strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="card mb-4">
            <div className="card__header">
              <h3 className="card__title">Документи закупівлі</h3>
            </div>
            <div className="card__body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {DOCUMENTS.map((d, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: 10,
                      border: '1px solid var(--border-soft)',
                      borderRadius: 6,
                      background: d.muted ? 'var(--surface-3)' : 'var(--surface-2)',
                      opacity: d.muted ? 0.6 : 1,
                    }}
                  >
                    <Icon name="paperclip" size={16} color="var(--text-muted)" />
                    <div style={{ flex: 1 }}>
                      <div className="text-sm" style={{ fontWeight: 500 }}>
                        {d.name}
                      </div>
                      <div className="text-xs muted">{d.sub}</div>
                    </div>
                    {!d.muted && <Icon name="download" size={14} color="var(--text-muted)" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <h3 className="card__title">Історія</h3>
            </div>
            <div className="card__body">
              <div className="timeline">
                <div className="timeline__item">
                  <span className="timeline__dot" />
                  <div className="timeline__title">Створення закупівлі</div>
                  <div className="timeline__meta">Дмитро Кравчук · 25 трав. 2026 · 09:11</div>
                </div>
                <div className="timeline__item">
                  <span className="timeline__dot" />
                  <div className="timeline__title">Замовлення підтверджено</div>
                  <div className="timeline__meta">Дмитро Кравчук · 25 трав. 2026 · 11:40</div>
                </div>
                <div className="timeline__item">
                  <span className="timeline__dot timeline__dot--success" />
                  <div className="timeline__title">Статус → Оплачено</div>
                  <div className="timeline__meta">Марія Бондарчук · 25 трав. 2026 · 16:18</div>
                </div>
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
                <dt>Постачальник</dt>
                <dd>
                  <strong>{supplier?.name}</strong>
                  <div className="text-xs muted">{supplier?.contact}</div>
                </dd>
                <dt>Дата</dt>
                <dd>{procurement.date}</dd>
                <dt>Сума</dt>
                <dd>
                  <strong className="tabular">{formatNumber(procurement.amount)} ₴</strong>
                </dd>
              </dl>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card__header">
              <h3 className="card__title">Під заявку</h3>
            </div>
            <div className="card__body">
              <EntityLink to="/requests/$requestId" params={{ requestId: procurement.request }}>
                {procurement.request}
              </EntityLink>
              <div className="text-sm muted mt-2">{getCounterparty('cp-101')?.name}</div>
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <h3 className="card__title">Джерело фінансування</h3>
            </div>
            <div className="card__body">
              {procurement.funding.length > 0 ? (
                procurement.funding.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
                    <EntityLink to="/contributions/$contributionId" params={{ contributionId: f }}>
                      {f}
                    </EntityLink>
                    <span className="text-sm muted" style={{ marginLeft: 'auto' }}>
                      —
                    </span>
                  </div>
                ))
              ) : (
                <div className="muted text-sm">Джерело не призначено</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {receiveOpen && (
        <ProcurementReceiveModal
          procId={procurement.id}
          onClose={() => setReceiveOpen(false)}
          onConfirm={() => {
            setReceiveOpen(false)
            showToast('Прийнято на склад')
          }}
        />
      )}
    </div>
  )
}
