import { useNavigate } from '@tanstack/react-router'
import { useToast } from '../../context/toast-context'
import { CONTRIBUTIONS } from '../../data/contributions'
import { PROC_STATUS_BY_KEY } from '../../data/statuses'
import { getContribution, getCounterparty, listProcurementsForContribution } from '../../data/queries'
import { formatNumber } from '../../lib/format'
import { PageHeader } from '../../components/layout/PageHeader'
import { Icon } from '../../components/ui/Icon'
import { Money } from '../../components/ui/Money'
import { StatusBadge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'

export function ContributionCard({ id }: { id: string }) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const contribution = getContribution(id) ?? CONTRIBUTIONS[0]
  const donor = getCounterparty(contribution.donor)
  const linkedProcurements = listProcurementsForContribution(contribution.id)
  const used = linkedProcurements.reduce((sum, p) => sum + p.amount, 0)
  const remaining = Math.max(0, contribution.amount - used)
  const usedPct = Math.min(100, (used / contribution.amount) * 100)

  return (
    <div className="page">
      <PageHeader
        breadcrumb={[
          { label: 'Внески', onClick: () => void navigate({ to: '/contributions' }) },
          { label: contribution.id },
        ]}
        title={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
            <span className="mono" style={{ fontSize: 'var(--fs-2xl)' }}>
              {contribution.id}
            </span>
            {contribution.form === 'monetary' ? (
              <span className="badge badge--success">грошовий</span>
            ) : (
              <span className="badge badge--violet">натуральний</span>
            )}
          </span>
        }
        subtitle={`${contribution.date} · ${donor?.name ?? ''}`}
        actions={
          <>
            <button className="btn" onClick={() => showToast('Документ завантажено')}>
              <Icon name="download" size={15} />
              Документ
            </button>
            <button className="btn" onClick={() => showToast('Редагування внеску незабаром')}>
              <Icon name="edit" size={15} />
              Редагувати
            </button>
          </>
        }
      />

      <div className="detail-grid">
        <div>
          <div className="card mb-4">
            <div className="card__header">
              <h3 className="card__title">Розподіл коштів</h3>
            </div>
            <div className="card__body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                <div className="stat" style={{ padding: 14 }}>
                  <div className="stat__label">Сума надходження</div>
                  <div className="stat__value" style={{ fontSize: 22 }}>
                    {formatNumber(contribution.amount)} ₴
                  </div>
                </div>
                <div className="stat" style={{ padding: 14 }}>
                  <div className="stat__label">Використано</div>
                  <div className="stat__value" style={{ fontSize: 22 }}>
                    {formatNumber(used)} ₴
                  </div>
                  <div className="stat__sub">{linkedProcurements.length} закупівлі</div>
                </div>
                <div className="stat" style={{ padding: 14 }}>
                  <div className="stat__label">Залишок</div>
                  <div
                    className="stat__value"
                    style={{ fontSize: 22, color: remaining > 0 ? 'var(--olive-700)' : 'var(--text-muted)' }}
                  >
                    {formatNumber(remaining)} ₴
                  </div>
                </div>
              </div>
              <div style={{ height: 8, background: 'var(--surface-3)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${usedPct}%`, height: '100%', background: 'var(--olive-500)' }} />
              </div>
              <div className="text-xs muted mt-2">
                {Math.round(usedPct)}% використано на пов'язані закупівлі
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <h3 className="card__title">Фінансовані закупівлі</h3>
              <span className="muted text-sm">{linkedProcurements.length}</span>
            </div>
            <table className="data">
              <thead>
                <tr>
                  <th>№</th>
                  <th>Постачальник</th>
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
                    <td>{getCounterparty(p.supplier)?.name}</td>
                    <td>{p.lines}</td>
                    <td>
                      <StatusBadge status={p.status} statuses={PROC_STATUS_BY_KEY} />
                    </td>
                    <td className="col-num">
                      <Money value={p.amount} />
                    </td>
                  </tr>
                ))}
                {linkedProcurements.length === 0 && (
                  <tr style={{ cursor: 'default' }}>
                    <td colSpan={5}>
                      <EmptyState
                        title="Поки не фінансує жодну закупівлю"
                        hint="Зв'яжіть цей внесок із закупівлею для прозорого обліку"
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="card mb-4">
            <div className="card__header">
              <h3 className="card__title">Деталі</h3>
            </div>
            <div className="card__body">
              <dl className="kv">
                <dt>Донор</dt>
                <dd>
                  <strong>{donor?.name}</strong>
                  <div className="text-xs muted">{donor?.form}</div>
                </dd>
                <dt>Дата</dt>
                <dd>{contribution.date}</dd>
                <dt>Форма</dt>
                <dd>{contribution.form === 'monetary' ? 'Грошовий' : 'Натуральний (товари/послуги)'}</dd>
                {contribution.form === 'in-kind' && (
                  <>
                    <dt>Позиція</dt>
                    <dd>
                      {contribution.itemName} · {contribution.itemQty} шт.
                    </dd>
                  </>
                )}
                <dt>Призначення</dt>
                <dd>{contribution.purpose}</dd>
                <dt>Документ-основа</dt>
                <dd>{contribution.doc}</dd>
                <dt>Зареєстрував</dt>
                <dd>Марія Бондарчук</dd>
              </dl>
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <h3 className="card__title">Документи</h3>
            </div>
            <div className="card__body">
              {[contribution.doc, 'Договір_пожертви.pdf', 'Сканкопія платіжки.pdf'].map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '7px 0',
                    borderBottom: i < 2 ? '1px solid var(--border-soft)' : 0,
                  }}
                >
                  <Icon name="paperclip" size={15} color="var(--text-muted)" />
                  <span className="text-sm" style={{ flex: 1 }}>
                    {f}
                  </span>
                  <Icon name="download" size={14} color="var(--text-muted)" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
