import { useNavigate } from '@tanstack/react-router'
import { useToast } from '../../context/toast-context'
import { COUNTERPARTIES } from '../../data/counterparties'
import { AUDIT } from '../../data/audit'
import { REQUEST_STATUS_BY_KEY, PROC_STATUS_BY_KEY } from '../../data/statuses'
import {
  getCounterparty,
  listContributionsByDonor,
  listProcurementsBySupplier,
  listRequestsByUnit,
} from '../../data/queries'
import { formatNumber } from '../../lib/format'
import { PageHeader } from '../../components/layout/PageHeader'
import { Icon } from '../../components/ui/Icon'
import { Money } from '../../components/ui/Money'
import { StatusBadge } from '../../components/ui/Badge'
import { COUNTERPARTY_TYPE_LABEL } from './CounterpartiesList'

export function CounterpartyCard({ id }: { id: string }) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const counterparty = getCounterparty(id) ?? COUNTERPARTIES[0]

  const linkedRequests = counterparty.type === 'unit' ? listRequestsByUnit(counterparty.id) : []
  const linkedContribs = counterparty.type === 'donor' ? listContributionsByDonor(counterparty.id) : []
  const linkedProcurements =
    counterparty.type === 'supplier' ? listProcurementsBySupplier(counterparty.id) : []
  const contribTotal = linkedContribs.reduce((sum, c) => sum + c.amount, 0)

  return (
    <div className="page">
      <PageHeader
        breadcrumb={[
          { label: 'Контрагенти', onClick: () => void navigate({ to: '/counterparties' }) },
          { label: counterparty.name },
        ]}
        title={counterparty.name}
        subtitle={`${COUNTERPARTY_TYPE_LABEL[counterparty.type]} · ${counterparty.form} · ${counterparty.code}`}
        actions={
          <>
            <button className="btn" onClick={() => showToast('Редагування контрагента незабаром')}>
              <Icon name="edit" size={15} />
              Редагувати
            </button>
            <button className="btn btn--primary" onClick={() => showToast('Нова операція незабаром')}>
              <Icon name="plus" size={15} />
              Нова операція
            </button>
          </>
        }
      />

      <div className="detail-grid">
        <div>
          {counterparty.type === 'unit' && (
            <div className="card mb-4">
              <div className="card__header">
                <h3 className="card__title">Заявки від підрозділу</h3>
                <span className="muted text-sm">{linkedRequests.length}</span>
              </div>
              <table className="data">
                <thead>
                  <tr>
                    <th>№</th>
                    <th>Дата</th>
                    <th>Позиції</th>
                    <th>Статус</th>
                    <th className="text-right">Сума</th>
                  </tr>
                </thead>
                <tbody>
                  {linkedRequests.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => void navigate({ to: '/requests/$requestId', params: { requestId: r.id } })}
                    >
                      <td className="col-id">{r.id}</td>
                      <td className="col-muted">{r.date}</td>
                      <td>{r.items}</td>
                      <td>
                        <StatusBadge status={r.status} statuses={REQUEST_STATUS_BY_KEY} />
                      </td>
                      <td className="col-num">
                        <Money value={r.value} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {counterparty.type === 'donor' && (
            <div className="card mb-4">
              <div className="card__header">
                <h3 className="card__title">Благодійні внески</h3>
                <span className="muted text-sm">
                  {linkedContribs.length} · Усього {formatNumber(contribTotal)} ₴
                </span>
              </div>
              <table className="data">
                <thead>
                  <tr>
                    <th>№</th>
                    <th>Дата</th>
                    <th>Форма</th>
                    <th>Призначення</th>
                    <th className="text-right">Сума</th>
                  </tr>
                </thead>
                <tbody>
                  {linkedContribs.map((co) => (
                    <tr
                      key={co.id}
                      onClick={() =>
                        void navigate({ to: '/contributions/$contributionId', params: { contributionId: co.id } })
                      }
                    >
                      <td className="col-id">{co.id}</td>
                      <td className="col-muted">{co.date}</td>
                      <td>{co.form === 'monetary' ? 'грошовий' : 'натуральний'}</td>
                      <td>{co.purpose}</td>
                      <td className="col-num">
                        <Money value={co.amount} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {counterparty.type === 'supplier' && (
            <div className="card mb-4">
              <div className="card__header">
                <h3 className="card__title">Закупівлі у постачальника</h3>
                <span className="muted text-sm">{linkedProcurements.length}</span>
              </div>
              <table className="data">
                <thead>
                  <tr>
                    <th>№</th>
                    <th>Дата</th>
                    <th>Позиції</th>
                    <th>Статус</th>
                    <th className="text-right">Сума</th>
                  </tr>
                </thead>
                <tbody>
                  {linkedProcurements.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() =>
                        void navigate({ to: '/procurements/$procurementId', params: { procurementId: p.id } })
                      }
                    >
                      <td className="col-id">{p.id}</td>
                      <td className="col-muted">{p.date}</td>
                      <td>{p.lines}</td>
                      <td>
                        <StatusBadge status={p.status} statuses={PROC_STATUS_BY_KEY} />
                      </td>
                      <td className="col-num">
                        <Money value={p.amount} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="card">
            <div className="card__header">
              <h3 className="card__title">Історія взаємодії</h3>
            </div>
            <div className="card__body">
              <div className="timeline">
                {AUDIT.slice(0, 5).map((a, i) => (
                  <div key={i} className="timeline__item">
                    <span className="timeline__dot" />
                    <div className="timeline__title">
                      {a.action} <span className="mono muted">{a.entity}</span>
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
        </div>

        <div>
          <div className="card mb-4">
            <div className="card__header">
              <h3 className="card__title">Реквізити</h3>
            </div>
            <div className="card__body">
              <dl className="kv">
                <dt>Назва</dt>
                <dd>{counterparty.name}</dd>
                <dt>Форма</dt>
                <dd>{counterparty.form}</dd>
                <dt>Код</dt>
                <dd className="mono">{counterparty.code}</dd>
                <dt>Контактна особа</dt>
                <dd>{counterparty.contact}</dd>
                <dt>Телефон</dt>
                <dd className="mono">{counterparty.phone}</dd>
                <dt>Email</dt>
                <dd className="mono text-sm">{counterparty.id.toLowerCase()}@partner.ua</dd>
                <dt>Канал</dt>
                <dd>{counterparty.channel}</dd>
                <dt>Примітка</dt>
                <dd className="muted text-sm">{counterparty.note}</dd>
              </dl>
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <h3 className="card__title">Зведення</h3>
            </div>
            <div className="card__body">
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span className="muted">Операцій</span>
                <span className="tabular">{counterparty.requests}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span className="muted">Перша взаємодія</span>
                <span>14 листоп. 2024</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span className="muted">Остання</span>
                <span>{counterparty.lastInteraction}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
