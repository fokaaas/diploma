import { useRef, useState } from 'react'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { useToast } from '../../context/toast-context'
import { useAuth, sessionStore } from '../../lib/auth/session'
import { ApiError } from '../../lib/api/client'
import {
  changeRequestStatus,
  deleteFile,
  deleteRequest,
  downloadFile,
  uploadRequestFile,
  NEXT_STATUSES,
  type RequestDetail,
} from '../../lib/api/requests'
import { PROC_STATUS_BY_KEY, REQUEST_STATUS_BY_KEY } from '../../data/statuses'
import { formatNumber } from '../../lib/format'
import type { RequestStatus } from '../../types/domain'
import { PageHeader } from '../../components/layout/PageHeader'
import { Icon } from '../../components/ui/Icon'
import { Money } from '../../components/ui/Money'
import { PriorityTag } from '../../components/ui/PriorityTag'
import { StatusBadge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Avatar } from '../../components/ui/Avatar'
import { initialsOf } from '../../lib/initials'
import { Lifecycle } from '../../components/ui/Lifecycle'
import { EntityLink } from '../../components/ui/EntityLink'
import { RelationshipGraph } from '../graph/RelationshipGraph'

const CAN_MANAGE: Record<string, boolean> = { admin: true, coordinator: true }
const LIFECYCLE: RequestStatus[] = [
  'new',
  'confirmed',
  'progress',
  'partial',
  'fulfilled',
  'closed',
]
const EDITABLE: RequestStatus[] = ['new', 'confirmed']

function formatDate(value: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('uk-UA', { dateStyle: 'medium' })
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('uk-UA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function RequestCard({ detail }: { detail: RequestDetail }) {
  const navigate = useNavigate()
  const router = useRouter()
  const { showToast } = useToast()
  const { user } = useAuth()
  const token = sessionStore.getAccessToken() ?? ''
  const canManage = CAN_MANAGE[user?.role ?? ''] ?? false
  const fileInput = useRef<HTMLInputElement>(null)

  const [graphOpen, setGraphOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)

  const nextStatuses = NEXT_STATUSES[detail.status]
  const canEdit = canManage && EDITABLE.includes(detail.status)

  const run = async (action: Promise<unknown>, success: string) => {
    try {
      await action
      showToast(success)
      await router.invalidate()
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Сталася помилка')
    }
  }

  const handleStatus = (status: RequestStatus) => {
    setStatusOpen(false)
    void run(changeRequestStatus(token, detail.id, status), 'Статус змінено')
  }

  const handleDelete = () =>
    run(deleteRequest(token, detail.id), 'Заявку видалено').then(() =>
      navigate({ to: '/requests' }),
    )

  const handleAddFiles = async (list: FileList | null) => {
    if (!list || list.length === 0) return
    try {
      for (const file of Array.from(list)) {
        await uploadRequestFile(token, detail.id, file)
      }
      showToast('Вкладення додано')
      await router.invalidate()
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Не вдалося завантажити файл')
    }
  }

  return (
    <div className="page">
      <PageHeader
        breadcrumb={[
          { label: 'Заявки', onClick: () => void navigate({ to: '/requests' }) },
          { label: detail.number },
        ]}
        title={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
            <span className="mono" style={{ fontSize: 'var(--fs-2xl)' }}>
              {detail.number}
            </span>
            <StatusBadge status={detail.status} statuses={REQUEST_STATUS_BY_KEY} />
            <PriorityTag value={detail.priority} />
          </span>
        }
        subtitle={`Зареєстрована ${formatDate(detail.date)} · ${detail.unitName}`}
        actions={
          <>
            <button className="btn" onClick={() => setGraphOpen(true)}>
              <Icon name="link" size={15} />
              Граф зв'язків
            </button>
            {canEdit && (
              <button
                className="btn"
                onClick={() =>
                  void navigate({
                    to: '/requests/$requestId/edit',
                    params: { requestId: detail.id },
                  })
                }
              >
                <Icon name="edit" size={15} />
                Редагувати
              </button>
            )}
            {canManage && nextStatuses.length > 0 && (
              <button className="btn btn--primary" onClick={() => setStatusOpen(true)}>
                <Icon name="check" size={15} />
                Змінити статус
              </button>
            )}
            {canManage && (
              <button className="btn btn--danger" onClick={() => void handleDelete()}>
                <Icon name="trash" size={15} />
                Видалити
              </button>
            )}
          </>
        }
      />

      <Lifecycle steps={LIFECYCLE} current={detail.status} byKey={REQUEST_STATUS_BY_KEY} />

      <div className="detail-grid">
        <div>
          <div className="card mb-4">
            <div className="card__header">
              <h3 className="card__title">Позиції до забезпечення</h3>
              <span className="muted text-sm">
                {detail.lineCount} рядки · сума {formatNumber(detail.estimatedValue)} ₴
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
                {detail.lines.map((l) => (
                  <tr key={l.id} style={{ cursor: 'default' }}>
                    <td style={{ fontWeight: 500 }}>{l.name}</td>
                    <td className="mono text-sm muted">{l.sku ?? '—'}</td>
                    <td className="col-num">
                      {l.quantity} {l.unit}
                    </td>
                    <td className="col-num">
                      <span className="muted">
                        {l.receivedQuantity} / {l.quantity}
                      </span>
                    </td>
                    <td className="text-sm muted">{l.techSpec ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card mb-4">
            <div className="card__header">
              <h3 className="card__title">Пов'язані закупівлі</h3>
              <span className="muted text-sm">{detail.linkedProcurements.length}</span>
            </div>
            <div className="card__body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {detail.linkedProcurements.map((p) => (
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
                      {p.number}
                    </EntityLink>
                    <span>{p.supplierName}</span>
                    <StatusBadge status={p.status} statuses={PROC_STATUS_BY_KEY} />
                    <span className="tabular" style={{ marginLeft: 'auto' }}>
                      <Money value={p.amount} />
                    </span>
                  </div>
                ))}
                {detail.linkedProcurements.length === 0 && (
                  <div className="muted text-sm">Поки що немає</div>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <h3 className="card__title">Історія змін</h3>
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
                <dt>Підрозділ</dt>
                <dd>
                  <strong>{detail.unitName}</strong>
                  {detail.unitNote && <div className="text-xs muted">{detail.unitNote}</div>}
                </dd>
                <dt>Координатор</dt>
                <dd>
                  {detail.unitContactName}
                  {detail.unitPhone && <div className="text-xs muted">{detail.unitPhone}</div>}
                </dd>
                <dt>Канал зв'язку</dt>
                <dd>{detail.channelLabel ?? '—'}</dd>
                <dt>Зареєстрував</dt>
                <dd>{detail.registeredByName}</dd>
                <dt>Виконавець</dt>
                <dd>{detail.assigneeName ?? '—'}</dd>
                <dt>Дедлайн</dt>
                <dd>{formatDate(detail.deadline)}</dd>
                <dt>Пріоритет</dt>
                <dd>
                  <PriorityTag value={detail.priority} />
                </dd>
              </dl>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card__header">
              <h3 className="card__title">Вкладення</h3>
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
                      onClick={() => void run(deleteFile(token, f.id), 'Вкладення видалено')}
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  )}
                </div>
              ))}
              {detail.files.length === 0 && (
                <div className="muted text-sm mb-2">Без вкладень</div>
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
                    Додати файл
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <h3 className="card__title">Контакт підрозділу</h3>
            </div>
            <div className="card__body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Avatar
                  initials={initialsOf(detail.unitContactName)}
                  size="md"
                  color="var(--olive-400)"
                />
                <div>
                  <div style={{ fontWeight: 500 }}>{detail.unitContactName}</div>
                  <div className="text-xs muted">
                    {detail.channelLabel ?? '—'} · {detail.unitPhone ?? '—'}
                  </div>
                </div>
              </div>
              <button
                className="btn w-full"
                onClick={() => showToast(`Звʼязок: ${initialsOf(detail.unitContactName)}`)}
              >
                <Icon name="phone" size={15} />
                Зв'язатися
              </button>
            </div>
          </div>
        </div>
      </div>

      {graphOpen && (
        <RelationshipGraph detail={detail} onClose={() => setGraphOpen(false)} />
      )}

      {statusOpen && (
        <Modal title="Зміна статусу заявки" onClose={() => setStatusOpen(false)}>
          <div className="muted text-sm mb-3">
            Поточний статус: {REQUEST_STATUS_BY_KEY[detail.status].label}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {nextStatuses.map((s) => (
              <button
                key={s}
                className={`btn ${s === 'rejected' ? 'btn--danger' : 'btn--primary'}`}
                onClick={() => handleStatus(s)}
              >
                {REQUEST_STATUS_BY_KEY[s].label}
              </button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  )
}
