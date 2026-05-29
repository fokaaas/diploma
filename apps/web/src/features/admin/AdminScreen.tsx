import { useState } from 'react'
import { getRouteApi, useRouter } from '@tanstack/react-router'
import { useToast } from '../../context/toast-context'
import { useAuth, sessionStore } from '../../lib/auth/session'
import { ApiError } from '../../lib/api/client'
import {
  blockUser,
  changeUserRole,
  inviteUser,
  resendInvitation,
  unblockUser,
  type AdminUser,
  type InviteUserInput,
} from '../../lib/api/users'
import {
  createCategory,
  createItem,
  deleteCategory,
  deleteItem,
  type CreateItemInput,
} from '../../lib/api/dictionaries'
import { updateFoundation, type UpdateFoundationInput } from '../../lib/api/foundation'
import type { Role } from '../../types/domain'
import { ROLE_LABELS } from '../../data/users'
import { initialsOf } from '../../lib/initials'
import { PageHeader } from '../../components/layout/PageHeader'
import { Icon } from '../../components/ui/Icon'
import { Avatar } from '../../components/ui/Avatar'
import { RowMenu, type RowMenuItem } from '../../components/ui/RowMenu'
import { InviteUserModal } from './InviteUserModal'
import { ChangeRoleModal } from './ChangeRoleModal'
import { AddCategoryModal } from './AddCategoryModal'
import { AddItemModal } from './AddItemModal'
import { FoundationDetailsForm } from './FoundationDetailsForm'

type Tab = 'users' | 'foundation' | 'dictionaries'

const routeApi = getRouteApi('/_app/admin')

function formatLastSeen(value: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleString('uk-UA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function AdminScreen() {
  const router = useRouter()
  const { showToast } = useToast()
  const { user: currentUser } = useAuth()
  const { foundation, users, categories, items } = routeApi.useLoaderData()
  const token = sessionStore.getAccessToken() ?? ''

  const [tab, setTab] = useState<Tab>('users')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [roleUser, setRoleUser] = useState<AdminUser | null>(null)
  const [addCategoryOpen, setAddCategoryOpen] = useState(false)
  const [addItemOpen, setAddItemOpen] = useState(false)

  const refresh = () => router.invalidate()

  const run = async (action: Promise<unknown>, success: string) => {
    try {
      await action
      showToast(success)
      await refresh()
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Сталася помилка')
    }
  }

  const handleInvite = async (input: InviteUserInput) => {
    await inviteUser(token, input)
    setInviteOpen(false)
    showToast('Запрошення надіслано')
    await refresh()
  }

  const handleChangeRole = async (role: Role) => {
    if (!roleUser) return
    await changeUserRole(token, roleUser.id, role)
    setRoleUser(null)
    showToast('Роль змінено')
    await refresh()
  }

  const handleAddCategory = async (name: string) => {
    await createCategory(token, name)
    setAddCategoryOpen(false)
    showToast('Категорію додано')
    await refresh()
  }

  const handleAddItem = async (input: CreateItemInput) => {
    await createItem(token, input)
    setAddItemOpen(false)
    showToast('Позицію додано')
    await refresh()
  }

  const handleSaveFoundation = async (input: UpdateFoundationInput) => {
    const updated = await updateFoundation(token, input)
    sessionStore.setFoundationName(updated.shortName)
    showToast('Реквізити збережено')
    await refresh()
  }

  const userMenu = (user: AdminUser): RowMenuItem[] => {
    const menu: RowMenuItem[] = [
      { label: 'Змінити роль', onClick: () => setRoleUser(user) },
    ]
    if (user.status === 'invited') {
      menu.push({
        label: 'Повторно надіслати запрошення',
        onClick: () => void run(resendInvitation(token, user.id), 'Запрошення повторно надіслано'),
      })
    }
    if (user.status === 'blocked') {
      menu.push({
        label: 'Розблокувати',
        onClick: () => void run(unblockUser(token, user.id), 'Користувача розблоковано'),
      })
    } else {
      menu.push({
        label: 'Заблокувати',
        danger: true,
        onClick: () => void run(blockUser(token, user.id), 'Користувача заблоковано'),
      })
    }
    return menu
  }

  return (
    <div className="page">
      <PageHeader
        title="Адміністрування фонду"
        subtitle="Користувачі, ролі, налаштування та довідники"
        actions={
          tab === 'users' ? (
            <button className="btn btn--primary" onClick={() => setInviteOpen(true)}>
              <Icon name="plus" size={15} />
              Запросити користувача
            </button>
          ) : null
        }
      />

      <div className="tabs">
        <button className={`tab ${tab === 'users' ? 'tab--active' : ''}`} onClick={() => setTab('users')}>
          Користувачі та ролі <span className="count">{users.length}</span>
        </button>
        <button className={`tab ${tab === 'foundation' ? 'tab--active' : ''}`} onClick={() => setTab('foundation')}>
          Реквізити фонду
        </button>
        <button className={`tab ${tab === 'dictionaries' ? 'tab--active' : ''}`} onClick={() => setTab('dictionaries')}>
          Довідники
        </button>
      </div>

      {tab === 'users' && (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Користувач</th>
                <th>Email</th>
                <th>Роль</th>
                <th>Статус</th>
                <th>Останній вхід</th>
                <th style={{ width: 80 }} />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ cursor: 'default' }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar
                        initials={initialsOf(u.fullName)}
                        color={u.status === 'blocked' ? '#cfcbb3' : 'var(--olive-300)'}
                      />
                      <span style={{ fontWeight: 500 }}>{u.fullName}</span>
                    </div>
                  </td>
                  <td className="mono text-sm muted">{u.email}</td>
                  <td>{ROLE_LABELS[u.role]}</td>
                  <td>
                    {u.status === 'active' && <span className="badge badge--success">активний</span>}
                    {u.status === 'invited' && <span className="badge badge--new">запрошений</span>}
                    {u.status === 'blocked' && <span className="badge badge--danger">заблокований</span>}
                  </td>
                  <td className="col-muted">{formatLastSeen(u.lastSeenAt)}</td>
                  <td className="text-right">
                    {u.id !== currentUser?.id && <RowMenu items={userMenu(u)} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'foundation' && (
        <FoundationDetailsForm foundation={foundation} onSave={handleSaveFoundation} />
      )}

      {tab === 'dictionaries' && (
        <div className="grid-2">
          <div className="card">
            <div className="card__header">
              <h3 className="card__title">Номенклатура товарів</h3>
              <button className="btn btn--sm" onClick={() => setAddItemOpen(true)}>
                <Icon name="plus" size={13} />
                Додати
              </button>
            </div>
            <table className="data">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Найменування</th>
                  <th>Категорія</th>
                  <th>Од.</th>
                  <th style={{ width: 48 }} />
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id} style={{ cursor: 'default' }}>
                    <td className="col-id">{i.sku}</td>
                    <td>{i.name}</td>
                    <td className="col-muted">{i.categoryName}</td>
                    <td className="col-muted">{i.unit}</td>
                    <td className="text-right">
                      <button
                        className="btn btn--icon btn--ghost btn--danger"
                        aria-label="Видалити"
                        onClick={() => void run(deleteItem(token, i.id), 'Позицію видалено')}
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr style={{ cursor: 'default' }}>
                    <td colSpan={5} className="muted text-center" style={{ padding: 20 }}>
                      Поки немає позицій
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="card">
            <div className="card__header">
              <h3 className="card__title">Категорії товарів</h3>
              <button className="btn btn--sm" onClick={() => setAddCategoryOpen(true)}>
                <Icon name="plus" size={13} />
                Додати
              </button>
            </div>
            <div className="card__body">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {categories.map((c) => (
                  <span
                    key={c.id}
                    className="badge badge--plain"
                    style={{ padding: '5px 6px 5px 12px', fontSize: 13, gap: 8 }}
                  >
                    {c.name}
                    <button
                      aria-label={`Видалити ${c.name}`}
                      onClick={() => void run(deleteCategory(token, c.id), 'Категорію видалено')}
                      style={{ background: 'transparent', border: 0, display: 'grid', placeItems: 'center', color: 'inherit', padding: 0 }}
                    >
                      <Icon name="x" size={13} />
                    </button>
                  </span>
                ))}
                {categories.length === 0 && <span className="muted text-sm">Поки немає категорій</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {inviteOpen && <InviteUserModal onClose={() => setInviteOpen(false)} onSubmit={handleInvite} />}
      {roleUser && (
        <ChangeRoleModal user={roleUser} onClose={() => setRoleUser(null)} onSubmit={handleChangeRole} />
      )}
      {addCategoryOpen && (
        <AddCategoryModal onClose={() => setAddCategoryOpen(false)} onSubmit={handleAddCategory} />
      )}
      {addItemOpen && (
        <AddItemModal categories={categories} onClose={() => setAddItemOpen(false)} onSubmit={handleAddItem} />
      )}
    </div>
  )
}
