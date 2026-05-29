import { useState } from 'react'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { useToast } from '../../context/toast-context'
import { useAuth, sessionStore } from '../../lib/auth/session'
import { ApiError } from '../../lib/api/client'
import {
  deleteCounterparty,
  updateCounterparty,
  type CounterpartyDetail,
  type CounterpartyInput,
} from '../../lib/api/counterparties'
import { REQUEST_STATUS_BY_KEY, PROC_STATUS_BY_KEY } from '../../data/statuses'
import { formatNumber } from '../../lib/format'
import { PageHeader } from '../../components/layout/PageHeader'
import { Icon } from '../../components/ui/Icon'
import { Money } from '../../components/ui/Money'
import { StatusBadge } from '../../components/ui/Badge'
import { CounterpartyModal } from './CounterpartyModal'
import { COUNTERPARTY_TYPE_LABEL } from './CounterpartiesList'

const CAN_MANAGE: Record<string, boolean> = { admin: true, coordinator: true }

function formatDate(value: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('uk-UA', { dateStyle: 'medium' })
}

export function CounterpartyCard({ detail }: { detail: CounterpartyDetail }) {
  const navigate = useNavigate()
  const router = useRouter()
  const { showToast } = useToast()
  const { user } = useAuth()
  const token = sessionStore.getAccessToken() ?? ''
  const canManage = CAN_MANAGE[user?.role ?? ''] ?? false
  const [editOpen, setEditOpen] = useState(false)

  const contribTotal = detail.linkedContributions.reduce((sum, c) => sum + c.amount, 0)

  const handleEdit = async (input: CounterpartyInput) => {
    await updateCounterparty(token, detail.id, {
      name: input.name,
      legalForm: input.legalForm,
      contactPerson: input.contactPerson,
      phone: input.phone,
      email: input.email,
      channel: input.channel,
      note: input.note,
      firstContactAt: input.firstContactAt,
    })
    setEditOpen(false)
    showToast('Зміни збережено')
    await router.invalidate()
  }

  const handleDelete = async () => {
    try {
      await deleteCounterparty(token, detail.id)
      showToast('Контрагента видалено')
      await navigate({ to: '/counterparties' })
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Не вдалося видалити')
    }
  }

  return (
    <div className="page">
      <PageHeader
        breadcrumb={[
          { label: 'Контрагенти', onClick: () => void navigate({ to: '/counterparties' }) },
          { label: detail.name },
        ]}
        title={detail.name}
        subtitle={`${COUNTERPARTY_TYPE_LABEL[detail.type]} · ${detail.legalFormLabel} · ${detail.code}`}
        actions={
          canManage ? (
            <>
              <button className="btn" onClick={() => setEditOpen(true)}>
                <Icon name="edit" size={15} />
                Редагувати
              </button>
              <button className="btn btn--danger" onClick={() => void handleDelete()}>
                <Icon name="trash" size={15} />
                Видалити
              </button>
            </>
          ) : null
        }
      />

      <div className="detail-grid">
        <div>
          {detail.type === 'unit' && (
            <div className="card mb-4">
              <div className="card__header">
                <h3 className="card__title">Заявки від підрозділу</h3>
                <span className="muted text-sm">{detail.linkedRequests.length}</span>
              </div>
              <table className="data">
                <thead>
                  <tr>
                    <th>№</th>
                    <th>Дата</th>
                    <th>Позиції</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.linkedRequests.map((r) => (
                    <tr key={r.id} style={{ cursor: 'default' }}>
                      <td className="col-id">{r.number}</td>
                      <td className="col-muted">{formatDate(r.date)}</td>
                      <td>{r.lineCount}</td>
                      <td>
                        <StatusBadge status={r.status} statuses={REQUEST_STATUS_BY_KEY} />
                      </td>
                    </tr>
                  ))}
                  {detail.linkedRequests.length === 0 && <EmptyRow span={4} />}
                </tbody>
              </table>
            </div>
          )}

          {detail.type === 'donor' && (
            <div className="card mb-4">
              <div className="card__header">
                <h3 className="card__title">Благодійні внески</h3>
                <span className="muted text-sm">
                  {detail.linkedContributions.length} · Усього {formatNumber(contribTotal)} ₴
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
                  {detail.linkedContributions.map((co) => (
                    <tr key={co.id} style={{ cursor: 'default' }}>
                      <td className="col-id">{co.number}</td>
                      <td className="col-muted">{formatDate(co.date)}</td>
                      <td>{co.form === 'monetary' ? 'грошовий' : 'натуральний'}</td>
                      <td>{co.purpose ?? '—'}</td>
                      <td className="col-num">
                        <Money value={co.amount} />
                      </td>
                    </tr>
                  ))}
                  {detail.linkedContributions.length === 0 && <EmptyRow span={5} />}
                </tbody>
              </table>
            </div>
          )}

          {detail.type === 'supplier' && (
            <div className="card mb-4">
              <div className="card__header">
                <h3 className="card__title">Закупівлі у постачальника</h3>
                <span className="muted text-sm">{detail.linkedProcurements.length}</span>
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
                  {detail.linkedProcurements.map((p) => (
                    <tr key={p.id} style={{ cursor: 'default' }}>
                      <td className="col-id">{p.number}</td>
                      <td className="col-muted">{formatDate(p.date)}</td>
                      <td>{p.lineCount}</td>
                      <td>
                        <StatusBadge status={p.status} statuses={PROC_STATUS_BY_KEY} />
                      </td>
                      <td className="col-num">
                        <Money value={p.amount} />
                      </td>
                    </tr>
                  ))}
                  {detail.linkedProcurements.length === 0 && <EmptyRow span={5} />}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <div className="card mb-4">
            <div className="card__header">
              <h3 className="card__title">Реквізити</h3>
            </div>
            <div className="card__body">
              <dl className="kv">
                <dt>Назва</dt>
                <dd>{detail.name}</dd>
                <dt>Форма</dt>
                <dd>{detail.legalFormLabel}</dd>
                <dt>Код</dt>
                <dd className="mono">{detail.code}</dd>
                <dt>Контактна особа</dt>
                <dd>{detail.contactPerson ?? '—'}</dd>
                <dt>Телефон</dt>
                <dd className="mono">{detail.phone ?? '—'}</dd>
                <dt>Email</dt>
                <dd className="mono text-sm">{detail.email ?? '—'}</dd>
                <dt>Канал</dt>
                <dd>{detail.channelLabel ?? '—'}</dd>
                <dt>Примітка</dt>
                <dd className="muted text-sm">{detail.note ?? '—'}</dd>
              </dl>
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <h3 className="card__title">Зведення</h3>
            </div>
            <div className="card__body">
              <SummaryRow label="Операцій" value={String(detail.operationsCount)} />
              <SummaryRow label="Перша взаємодія" value={formatDate(detail.firstContactAt)} />
              <SummaryRow label="Остання" value={formatDate(detail.lastInteractionAt)} />
            </div>
          </div>
        </div>
      </div>

      {editOpen && (
        <CounterpartyModal
          initial={detail}
          onClose={() => setEditOpen(false)}
          onSubmit={handleEdit}
        />
      )}
    </div>
  )
}

function EmptyRow({ span }: { span: number }) {
  return (
    <tr style={{ cursor: 'default' }}>
      <td colSpan={span} className="muted text-center" style={{ padding: 18 }}>
        Поки немає операцій
      </td>
    </tr>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
      <span className="muted">{label}</span>
      <span>{value}</span>
    </div>
  )
}
