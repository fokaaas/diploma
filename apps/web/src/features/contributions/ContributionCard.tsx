import { useRef } from 'react'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { useToast } from '../../context/toast-context'
import { useAuth, sessionStore } from '../../lib/auth/session'
import { ApiError } from '../../lib/api/client'
import { deleteFile, downloadFile } from '../../lib/api/files'
import {
  deleteContribution,
  uploadContributionFile,
  type ContributionDetail,
} from '../../lib/api/contributions'
import { PROC_STATUS_BY_KEY } from '../../data/statuses'
import { formatNumber } from '../../lib/format'
import { PageHeader } from '../../components/layout/PageHeader'
import { Icon } from '../../components/ui/Icon'
import { Money } from '../../components/ui/Money'
import { StatusBadge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'

const CAN_MANAGE: Record<string, boolean> = { admin: true, accountant: true }

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('uk-UA', { dateStyle: 'medium' })
}

export function ContributionCard({ detail }: { detail: ContributionDetail }) {
  const navigate = useNavigate()
  const router = useRouter()
  const { showToast } = useToast()
  const { user } = useAuth()
  const token = sessionStore.getAccessToken() ?? ''
  const canManage = CAN_MANAGE[user?.role ?? ''] ?? false
  const fileInput = useRef<HTMLInputElement>(null)

  const used = detail.allocatedTotal
  const remaining = detail.unspent
  const usedPct = detail.amount > 0 ? Math.min(100, (used / detail.amount) * 100) : 0

  const run = async (action: Promise<unknown>, success: string) => {
    try {
      await action
      showToast(success)
      await router.invalidate()
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Сталася помилка')
    }
  }

  const handleDelete = () =>
    run(deleteContribution(token, detail.id), 'Внесок видалено').then(() =>
      navigate({ to: '/contributions' }),
    )

  const handleAddFiles = async (list: FileList | null) => {
    if (!list || list.length === 0) return
    try {
      for (const file of Array.from(list)) {
        await uploadContributionFile(token, detail.id, file)
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
          { label: 'Внески', onClick: () => void navigate({ to: '/contributions' }) },
          { label: detail.number },
        ]}
        title={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
            <span className="mono" style={{ fontSize: 'var(--fs-2xl)' }}>
              {detail.number}
            </span>
            {detail.form === 'monetary' ? (
              <span className="badge badge--success">грошовий</span>
            ) : (
              <span className="badge badge--violet">натуральний</span>
            )}
          </span>
        }
        subtitle={`${formatDate(detail.date)} · ${detail.donorName}`}
        actions={
          canManage ? (
            <>
              <button
                className="btn"
                onClick={() =>
                  void navigate({
                    to: '/contributions/$contributionId/edit',
                    params: { contributionId: detail.id },
                  })
                }
              >
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
          <div className="card mb-4">
            <div className="card__header">
              <h3 className="card__title">Розподіл коштів</h3>
            </div>
            <div className="card__body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                <div className="stat" style={{ padding: 14 }}>
                  <div className="stat__label">Сума надходження</div>
                  <div className="stat__value" style={{ fontSize: 22 }}>
                    {formatNumber(detail.amount)} ₴
                  </div>
                </div>
                <div className="stat" style={{ padding: 14 }}>
                  <div className="stat__label">Використано</div>
                  <div className="stat__value" style={{ fontSize: 22 }}>
                    {formatNumber(used)} ₴
                  </div>
                  <div className="stat__sub">{detail.linkedProcurements.length} закупівлі</div>
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
              <span className="muted text-sm">{detail.linkedProcurements.length}</span>
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
                {detail.linkedProcurements.map((p) => (
                  <tr key={p.id} style={{ cursor: 'default' }}>
                    <td className="col-id">{p.number}</td>
                    <td>{p.supplierName}</td>
                    <td>{p.lineCount}</td>
                    <td>
                      <StatusBadge status={p.status} statuses={PROC_STATUS_BY_KEY} />
                    </td>
                    <td className="col-num">
                      <Money value={p.amount} />
                    </td>
                  </tr>
                ))}
                {detail.linkedProcurements.length === 0 && (
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
                  <strong>{detail.donorName}</strong>
                  {detail.donorNote && <div className="text-xs muted">{detail.donorNote}</div>}
                </dd>
                <dt>Дата</dt>
                <dd>{formatDate(detail.date)}</dd>
                <dt>Форма</dt>
                <dd>{detail.form === 'monetary' ? 'Грошовий' : 'Натуральний (товари/послуги)'}</dd>
                {detail.form === 'in-kind' && (
                  <>
                    <dt>Позиція</dt>
                    <dd>
                      {detail.itemName ?? '—'}
                      {detail.itemQuantity ? ` · ${detail.itemQuantity} шт.` : ''}
                    </dd>
                  </>
                )}
                <dt>Призначення</dt>
                <dd>{detail.purpose ?? '—'}</dd>
                <dt>Документ-основа</dt>
                <dd>{detail.baseDocumentLabel ?? '—'}</dd>
                <dt>Зареєстрував</dt>
                <dd>{detail.registeredByName}</dd>
              </dl>
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <h3 className="card__title">Документи</h3>
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
        </div>
      </div>
    </div>
  )
}
