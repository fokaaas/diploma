import { useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { useToast } from '../../context/toast-context'
import { USERS, ROLE_LABELS } from '../../data/users'
import { ITEMS } from '../../data/items'
import { PageHeader } from '../../components/layout/PageHeader'
import { Icon } from '../../components/ui/Icon'
import { Avatar } from '../../components/ui/Avatar'
import { InviteUserModal } from './InviteUserModal'

type Tab = 'users' | 'foundation' | 'dictionaries'

const CATEGORIES = ['БПЛА', 'РЕБ', 'Медицина', 'Спорядження', 'Оптика', 'Звʼязок', 'Енергозабезп.', 'Транспорт']

const routeApi = getRouteApi('/_app/admin')

export function AdminScreen() {
  const { showToast } = useToast()
  const foundation = routeApi.useLoaderData()
  const [tab, setTab] = useState<Tab>('users')
  const [inviteOpen, setInviteOpen] = useState(false)

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
          Користувачі та ролі <span className="count">{USERS.length}</span>
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
              {USERS.map((u) => (
                <tr key={u.id} style={{ cursor: 'default' }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar initials={u.initials} color={u.status === 'blocked' ? '#cfcbb3' : 'var(--olive-300)'} />
                      <span style={{ fontWeight: 500 }}>{u.name}</span>
                    </div>
                  </td>
                  <td className="mono text-sm muted">{u.email}</td>
                  <td>{ROLE_LABELS[u.role]}</td>
                  <td>
                    {u.status === 'active' && <span className="badge badge--success">активний</span>}
                    {u.status === 'invited' && <span className="badge badge--new">запрошений</span>}
                    {u.status === 'blocked' && <span className="badge badge--danger">заблокований</span>}
                  </td>
                  <td className="col-muted">{u.lastSeen}</td>
                  <td>
                    <button
                      className="btn btn--icon btn--ghost"
                      aria-label="Дії"
                      onClick={() => showToast(`Дії для ${u.name}`)}
                    >
                      <Icon name="more" size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'foundation' && (
        <div className="grid-2">
          <div className="card">
            <div className="card__header">
              <h3 className="card__title">Загальні дані</h3>
            </div>
            <div className="card__body">
              <div className="field">
                <label>Повна назва</label>
                <input className="input" defaultValue={foundation?.legalName ?? ''} />
              </div>
              <div className="field">
                <label>Скорочена назва</label>
                <input className="input" defaultValue={foundation?.shortName ?? ''} />
              </div>
              <div className="form-row">
                <div className="field">
                  <label>Код ЄДРПОУ</label>
                  <input className="input" defaultValue={foundation?.edrpou ?? ''} />
                </div>
                <div className="field">
                  <label>ІПН</label>
                  <input className="input" defaultValue={foundation?.taxId ?? ''} />
                </div>
              </div>
              <div className="field">
                <label>Юридична адреса</label>
                <input className="input" defaultValue={foundation?.address ?? ''} />
              </div>
              <div className="field">
                <label>Сайт</label>
                <input className="input" defaultValue={foundation?.website ?? ''} />
              </div>
            </div>
            <div className="card__footer text-right">
              <button className="btn btn--primary" onClick={() => showToast('Реквізити збережено')}>
                Зберегти
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'dictionaries' && (
        <div className="grid-2">
          <div className="card">
            <div className="card__header">
              <h3 className="card__title">Номенклатура товарів</h3>
              <button className="btn btn--sm" onClick={() => showToast('Додавання позиції незабаром')}>
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
                </tr>
              </thead>
              <tbody>
                {ITEMS.slice(0, 6).map((i) => (
                  <tr key={i.id} style={{ cursor: 'default' }}>
                    <td className="col-id">{i.sku}</td>
                    <td>{i.name}</td>
                    <td className="col-muted">{i.category}</td>
                    <td className="col-muted">{i.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card">
            <div className="card__header">
              <h3 className="card__title">Категорії товарів</h3>
              <button className="btn btn--sm" onClick={() => showToast('Додавання категорії незабаром')}>
                <Icon name="plus" size={13} />
                Додати
              </button>
            </div>
            <div className="card__body">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {CATEGORIES.map((c) => (
                  <span key={c} className="badge badge--plain" style={{ padding: '5px 12px', fontSize: 13 }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {inviteOpen && (
        <InviteUserModal
          onClose={() => setInviteOpen(false)}
          onSend={() => {
            setInviteOpen(false)
            showToast('Запрошення надіслано')
          }}
        />
      )}
    </div>
  )
}
