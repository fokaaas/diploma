import { useState } from 'react'
import { getRouteApi, useNavigate, useRouter } from '@tanstack/react-router'
import { useToast } from '../../context/toast-context'
import { createFoundation, type CreateFoundationInput } from '../../lib/api/platform'
import { usePlatformAuth } from '../../lib/auth/platform-session'
import { PageHeader } from '../../components/layout/PageHeader'
import { Icon } from '../../components/ui/Icon'
import type { IconName } from '../../components/ui/Icon'
import { EmptyState } from '../../components/ui/EmptyState'
import { CreateFoundationModal } from './CreateFoundationModal'

const routeApi = getRouteApi('/super-admin')

const NAV_ITEMS: { label: string; icon: IconName }[] = [
  { label: 'Фонди (клієнти)', icon: 'shield' },
]

function formatDate(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString('uk-UA')
}

export function SuperAdminScreen() {
  const navigate = useNavigate()
  const router = useRouter()
  const { showToast } = useToast()
  const { admin, accessToken, logout } = usePlatformAuth()
  const foundations = routeApi.useLoaderData()
  const [createOpen, setCreateOpen] = useState(false)

  const handleCreate = async (input: CreateFoundationInput) => {
    if (!accessToken) return
    await createFoundation(accessToken, input)
    setCreateOpen(false)
    showToast('Фонд створено, запрошення надіслано')
    await router.invalidate()
  }

  const counts = {
    total: foundations.length,
    active: foundations.filter((f) => f.adminStatus === 'ACTIVE').length,
    invited: foundations.filter((f) => f.adminStatus === 'INVITED').length,
    blocked: foundations.filter((f) => f.adminStatus === 'BLOCKED').length,
  }

  return (
    <div className="app-shell" style={{ gridTemplateColumns: '240px 1fr' }}>
      <aside className="sidebar" style={{ background: '#1f2614', color: '#dcdfd0', borderRight: '1px solid #2c331e' }}>
        <div className="sidebar__logo" style={{ borderColor: '#2c331e' }}>
          <span className="sidebar__logo-mark" style={{ background: '#c98a2e', color: '#1f2614' }}>
            SA
          </span>
          <span style={{ color: '#fff' }}>
            Super-Admin
            <br />
            панель платформи
          </span>
        </div>
        <div className="sidebar__section-label" style={{ color: '#8a8f72' }}>
          Платформа
        </div>
        {NAV_ITEMS.map((item) => (
          <div
            key={item.label}
            className="sidebar__item"
            style={{ color: '#fff', background: '#3a4628' }}
          >
            <span className="sidebar__item-icon">
              <Icon name={item.icon} size={16} />
            </span>
            <span>{item.label}</span>
          </div>
        ))}
        <div className="sidebar__role-switcher" style={{ borderColor: '#2c331e', color: '#a3a98a' }}>
          <button
            className="btn w-full"
            style={{ background: 'transparent', borderColor: '#3a4628', color: '#dcdfd0' }}
            onClick={() => void navigate({ to: '/' })}
          >
            <Icon name="arrow-left" size={14} />
            До фонду-клієнта
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar__brand muted text-sm">
            <Icon name="shield" size={14} /> Платформа · інстанс <span className="mono">prod-eu-1</span>
          </div>
          <div style={{ flex: 1 }} />
          <div className="topbar__right">
            <button
              className="btn btn--sm"
              onClick={() => {
                void logout()
                void navigate({ to: '/platform-login' })
              }}
            >
              <Icon name="logout" size={15} />
              Вийти
            </button>
            <div className="user-chip">
              <span className="user-chip__avatar" style={{ background: '#c98a2e', color: '#1f2614' }}>
                SA
              </span>
              <span>
                <div className="user-chip__name">{admin?.name ?? 'Платформа'}</div>
                <div className="user-chip__role">{admin?.email ?? 'root'}</div>
              </span>
            </div>
          </div>
        </header>
        <div className="page">
          <PageHeader
            title="Фонди-клієнти платформи"
            subtitle="Огляд організацій, що користуються системою, та їхніх адміністраторів"
            actions={
              <button className="btn btn--primary" onClick={() => setCreateOpen(true)}>
                <Icon name="plus" size={15} />
                Створити фонд
              </button>
            }
          />

          <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="stat">
              <div className="stat__label">Усього фондів</div>
              <div className="stat__value">{counts.total}</div>
            </div>
            <div className="stat">
              <div className="stat__label">Активних</div>
              <div className="stat__value">{counts.active}</div>
              <div className="stat__sub">з активним адміністратором</div>
            </div>
            <div className="stat">
              <div className="stat__label">Очікують активації</div>
              <div className="stat__value">{counts.invited}</div>
              <div className="stat__delta stat__delta--warn">не прийняли запрошення</div>
            </div>
            <div className="stat">
              <div className="stat__label">Заблокованих</div>
              <div className="stat__value">{counts.blocked}</div>
            </div>
          </div>

          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Назва фонду</th>
                  <th>Адміністратор</th>
                  <th>Статус адміна</th>
                  <th className="text-right">Користувачів</th>
                  <th>Створено</th>
                </tr>
              </thead>
              <tbody>
                {foundations.map((f) => (
                  <tr key={f.id} style={{ cursor: 'default' }}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{f.name}</div>
                      <div className="text-xs muted mono">{f.id}</div>
                    </td>
                    <td>
                      <div>{f.adminName ?? '—'}</div>
                      <div className="text-xs muted mono">{f.adminEmail ?? ''}</div>
                    </td>
                    <td>
                      {f.adminStatus === 'ACTIVE' && <span className="badge badge--success">активний</span>}
                      {f.adminStatus === 'INVITED' && <span className="badge badge--new">запрошений</span>}
                      {f.adminStatus === 'BLOCKED' && <span className="badge badge--danger">заблокований</span>}
                    </td>
                    <td className="col-num">{f.userCount}</td>
                    <td className="col-muted">{formatDate(f.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {foundations.length === 0 && (
              <EmptyState title="Поки немає фондів" hint="Створіть перший фонд-клієнт платформи" />
            )}
          </div>
        </div>
      </div>

      {createOpen && (
        <CreateFoundationModal onClose={() => setCreateOpen(false)} onSubmit={handleCreate} />
      )}
    </div>
  )
}
