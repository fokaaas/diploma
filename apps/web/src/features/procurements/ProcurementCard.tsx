import { useRef, useState } from 'react'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { useToast } from '../../context/toast-context'
import { useAuth, sessionStore } from '../../lib/auth/session'
import { ApiError } from '../../lib/api/client'
import { deleteFile, downloadFile } from '../../lib/api/files'
import {
  changeProcurementStatus,
  deleteProcurement,
  receiveProcurement,
  uploadProcurementFile,
  NEXT_STATUSES,
  type ProcurementDetail,
  type ReceiveInput,
} from '../../lib/api/procurements'
import type { Warehouse } from '../../lib/api/warehouses'
import { PROC_LIFECYCLE, PROC_STATUS_BY_KEY } from '../../data/statuses'
import { formatNumber } from '../../lib/format'
import type { ProcStatus } from '../../types/domain'
import { PageHeader } from '../../components/layout/PageHeader'
import { Icon } from '../../components/ui/Icon'
import { Money } from '../../components/ui/Money'
import { StatusBadge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Lifecycle } from '../../components/ui/Lifecycle'
import { EntityLink } from '../../components/ui/EntityLink'
import { ProcurementReceiveModal } from './ProcurementReceiveModal'

const CAN_MANAGE: Record<string, boolean> = {
  admin: true,
  coordinator: true,
  accountant: true,
}
const EDITABLE: ProcStatus[] = ['draft', 'ordered']
const RECEIVABLE: ProcStatus[] = ['ordered', 'paid']

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('uk-UA', { dateStyle: 'medium' })
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('uk-UA', { dateStyle: 'medium', timeStyle: 'short' })
}

export function ProcurementCard({
  detail,
  warehouses,
}: {
  detail: ProcurementDetail
  warehouses: Warehouse[]
}) {
  const navigate = useNavigate()
  const router = useRouter()
  const { showToast } = useToast()
  const { user } = useAuth()
  const token = sessionStore.getAccessToken() ?? ''
  const canManage = CAN_MANAGE[user?.role ?? ''] ?? false
  const fileInput = useRef<HTMLInputElement>(null)

  const [statusOpen, setStatusOpen] = useState(false)
  const [receiveOpen, setReceiveOpen] = useState(false)

  const nextStatuses = NEXT_STATUSES[detail.status]
  const canEdit = canManage && EDITABLE.includes(detail.status)
  const canReceive = canManage && RECEIVABLE.includes(detail.status)

  const run = async (action: Promise<unknown>, success: string) => {
    try {
      await action
      showToast(success)
      await router.invalidate()
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Сталася помилка')
    }
  }

  const handleStatus = (status: ProcStatus) => {
    setStatusOpen(false)
    void run(changeProcurementStatus(token, detail.id, status), 'Статус змінено')
  }

  const handleReceive = async (input: ReceiveInput) => {
    await receiveProcurement(token, detail.id, input)
    setReceiveOpen(false)
    showToast('Прийнято на склад')
    await router.invalidate()
  }

  const handleDelete = () =>
    run(deleteProcurement(token, detail.id), 'Закупівлю видалено').then(() =>
      navigate({ to: '/procurements' }),
    )

  const handleAddFiles = async (list: FileList | null) => {
    if (!list || list.length === 0) return
    try {
      for (const file of Array.from(list)) {
        await uploadProcurementFile(token, detail.id, file)
      }
      showToast('Документ додано')
      await router.invalidate()
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Не вдалося завантажити файл')
    }
  }

  return (
    <div className="page">
      <PageHeader
        breadcrumb={[
          { label: 'Закупівлі', onClick: () => void navigate({ to: '/procurements' }) },
          { label: detail.number },
        ]}
        title={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
            <span className="mono" style={{ fontSize: 'var(--fs-2xl)' }}>
              {detail.number}
            </span>
            <StatusBadge status={detail.status} statuses={PROC_STATUS_BY_KEY} />
          </span>
        }
        subtitle={`${formatDate(detail.date)} · ${detail.supplierName}`}
        actions={
          canManage ? (
            <>
              {canEdit && (
                <button
                  className="btn"
                  onClick={() =>
                    void navigate({
                      to: '/procurements/$procurementId/edit',
                      params: { procurementId: detail.id },
                    })
                  }
                >
                  <Icon name="edit" size={15} />
                  Редагувати
                </button>
              )}
              {canReceive && (
                <button className="btn btn--primary" onClick={() => setReceiveOpen(true)}>
                  <Icon name="box" size={15} />
                  Прийняти на склад
                </button>
              )}
              {nextStatuses.length > 0 && (
                <button className="btn" onClick={() => setStatusOpen(true)}>
                  <Icon name="check" size={15} />
                  Змінити статус
                </button>
              )}
              <button className="btn btn--danger" onClick={() => void handleDelete()}>
                <Icon name="trash" size={15} />
                Видалити
              </button>
            </>
          ) : null
        }
      />

      <Lifecycle steps={PROC_LIFECYCLE} current={detail.status} byKey={PROC_STATUS_BY_KEY} />

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
                  <th className="col-num">К-сть</th>
                  <th className="col-num">Ціна</th>
                  <th className="text-right">Сума</th>
                </tr>
              </thead>
              <tbody>
                {detail.lines.map((l) => (
                  <tr key={l.id} style={{ cursor: 'default' }}>
                    <td style={{ fontWeight: 500 }}>{l.name}</td>
                    <td className="mono text-sm muted">{l.sku ?? '—'}</td>
                    <td className="col-num">{l.quantity}</td>
                    <td className="col-num">{formatNumber(l.unitPrice)} ₴</td>
                    <td className="col-num">
                      <Money value={l.lineTotal} />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ cursor: 'default' }}>
                  <td colSpan={4} className="text-right muted">
                    Усього
                  </td>
                  <td className="col-num">
                    <strong>
                      <Money value={detail.totalAmount} />
                    </strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {detail.goodsReceipts.length > 0 && (
            <div className="card mb-4">
              <div className="card__header">
                <h3 className="card__title">Прийоми на склад</h3>
                <span className="muted text-sm">{detail.goodsReceipts.length}</span>
              </div>
              <div className="card__body">
                {detail.goodsReceipts.map((r) => (
                  <div key={r.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-soft)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong className="text-sm">{r.warehouseName}</strong>
                      <span className="text-xs muted">{formatDateTime(r.receivedAt)}</span>
                    </div>
                    <div className="text-sm muted">
                      {r.lines.map((l) => `${l.itemName} ×${l.quantity}`).join(' · ')}
                    </div>
                    {r.note && <div className="text-xs muted">{r.note}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card mb-4">
            <div className="card__header">
              <h3 className="card__title">Документи закупівлі</h3>
              <span className="muted text-sm">{detail.files.length}</span>
            </div>
            <div className="card__body">
              {detail.files.map((f) => (
                <div
                  key={f.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '7px 0',
                    borderBottom: '1px solid var(--border-soft)',
                  }}
                >
                  <Icon name="paperclip" size={15} color="var(--text-muted)" />
                  <span className="text-sm" style={{ flex: 1, wordBreak: 'break-all' }}>
                    {f.originalName}
                  </span>
                  <button
                    className="btn btn--icon btn--ghost"
                    aria-label="Завантажити"
                    onClick={() =>
                      void downloadFile(token, f.id, f.originalName).catch(() =>
                        showToast('Не вдалося завантажити'),
                      )
                    }
                  >
                    <Icon name="download" size={14} />
                  </button>
                  {canManage && (
                    <button
                      className="btn btn--icon btn--ghost btn--danger"
                      aria-label="Видалити"
                      onClick={() => void run(deleteFile(token, f.id), 'Документ видалено')}
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  )}
                </div>
              ))}
              {detail.files.length === 0 && (
                <div className="muted text-sm mb-2">Без документів</div>
              )}
              {canManage && (
                <>
                  <input
                    ref={fileInput}
                    type="file"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => void handleAddFiles(e.target.files)}
                  />
                  <button
                    className="btn btn--sm w-full"
                    style={{ marginTop: 10 }}
                    onClick={() => fileInput.current?.click()}
                  >
                    <Icon name="upload" size={14} />
                    Додати документ
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <h3 className="card__title">Історія</h3>
            </div>
            <div className="card__body">
              {detail.history.length === 0 ? (
                <div className="muted text-sm">Поки немає записів</div>
              ) : (
                <div className="timeline">
                  {detail.history.map((h, i) => (
                    <div key={i} className="timeline__item">
                      <span className="timeline__dot" />
                      <div className="timeline__title">{h.action}</div>
                      <div className="timeline__meta">
                        {h.actorName} · {formatDateTime(h.createdAt)}
                      </div>
                      <div className="timeline__body">{h.summary}</div>
                    </div>
                  ))}
                </div>
              )}
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
                  <strong>{detail.supplierName}</strong>
                </dd>
                <dt>Дата</dt>
                <dd>{formatDate(detail.date)}</dd>
                <dt>Створив</dt>
                <dd>{detail.createdByName}</dd>
                <dt>Сума</dt>
                <dd>
                  <strong className="tabular">{formatNumber(detail.totalAmount)} ₴</strong>
                </dd>
              </dl>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card__header">
              <h3 className="card__title">Під заявку</h3>
            </div>
            <div className="card__body">
              {detail.requestId ? (
                <>
                  <EntityLink to="/requests/$requestId" params={{ requestId: detail.requestId }}>
                    {detail.requestNumber}
                  </EntityLink>
                  <div className="text-sm muted mt-2">{detail.requestUnitName}</div>
                </>
              ) : (
                <div className="muted text-sm">Без прив'язки до заявки</div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <h3 className="card__title">Джерело фінансування</h3>
              <span className="muted text-sm">{formatNumber(detail.fundedTotal)} ₴</span>
            </div>
            <div className="card__body">
              {detail.funding.length > 0 ? (
                detail.funding.map((f) => (
                  <div
                    key={f.contributionId}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}
                  >
                    <EntityLink
                      to="/contributions/$contributionId"
                      params={{ contributionId: f.contributionId }}
                    >
                      {f.contributionNumber}
                    </EntityLink>
                    <span className="text-xs muted">{f.donorName}</span>
                    <span className="tabular text-sm" style={{ marginLeft: 'auto' }}>
                      {formatNumber(f.allocatedAmount)} ₴
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
          procurement={detail}
          warehouses={warehouses}
          onClose={() => setReceiveOpen(false)}
          onSubmit={handleReceive}
        />
      )}

      {statusOpen && (
        <Modal title="Зміна статусу закупівлі" onClose={() => setStatusOpen(false)}>
          <div className="muted text-sm mb-3">
            Поточний статус: {PROC_STATUS_BY_KEY[detail.status].label}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {nextStatuses.map((s) => (
              <button key={s} className="btn btn--primary" onClick={() => handleStatus(s)}>
                {PROC_STATUS_BY_KEY[s].label}
              </button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  )
}
