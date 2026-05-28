import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useToast } from '../../context/toast-context'
import { PageHeader } from '../../components/layout/PageHeader'
import { Icon } from '../../components/ui/Icon'
import type { IconName } from '../../components/ui/Icon'
import { CreateFoundationModal } from './CreateFoundationModal'

type AdminStatus = 'active' | 'invited' | 'blocked'

interface ClientFoundation {
  id: string
  name: string
  created: string
  admin: string
  adminEmail: string
  adminStatus: AdminStatus
  users: number
  storage: string
  plan: string
}

const FOUNDATIONS: ClientFoundation[] = [
  { id: 'fnd-001', name: 'Спільнота Стерненка', created: '14 січ. 2025', admin: 'Анастасія Левченко', adminEmail: 'a.levchenko@sternenko.fund', adminStatus: 'active', users: 7, storage: '1,8 ГБ', plan: 'Pro' },
  { id: 'fnd-002', name: 'БФ «Повернись живим»', created: '02 лют. 2025', admin: 'Сергій Грицик', adminEmail: 's.h@example.org', adminStatus: 'active', users: 24, storage: '14 ГБ', plan: 'Enterprise' },
  { id: 'fnd-003', name: 'Hospitallers UA', created: '21 бер. 2025', admin: "Анна Юр'єва", adminEmail: 'a.yurieva@hospitallers.ua', adminStatus: 'active', users: 12, storage: '4,1 ГБ', plan: 'Pro' },
  { id: 'fnd-004', name: 'БФ «Сестра Жанна»', created: '08 кв. 2026', admin: 'Жанна Чугай', adminEmail: 'zh.ch@sestrazhanna.org', adminStatus: 'invited', users: 1, storage: '12 МБ', plan: 'Trial' },
  { id: 'fnd-005', name: 'БФ «Хижак»', created: '12 трав. 2026', admin: 'Олег Тимченко', adminEmail: 'o.t@hijak.org', adminStatus: 'invited', users: 1, storage: '0 МБ', plan: 'Trial' },
  { id: 'fnd-006', name: 'БФ «Український легіон»', created: '17 лип. 2025', admin: 'Михайло Білоус', adminEmail: 'm.bilous@ulegion.org', adminStatus: 'blocked', users: 0, storage: '0 МБ', plan: 'Suspended' },
]

const NAV_ITEMS: { label: string; icon: IconName; active?: boolean; count?: number }[] = [
  { label: 'Огляд', icon: 'dashboard' },
  { label: 'Фонди (клієнти)', icon: 'shield', active: true, count: 6 },
  { label: 'Білінг та плани', icon: 'contributions' },
  { label: 'Системні події', icon: 'audit' },
  { label: 'Бекапи', icon: 'box' },
  { label: 'Інтеграції', icon: 'sliders' },
]

export function SuperAdminScreen() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [createOpen, setCreateOpen] = useState(false)

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
            style={{
              color: item.active ? '#fff' : '#dcdfd0',
              background: item.active ? '#3a4628' : 'transparent',
            }}
            onClick={() => !item.active && showToast(`${item.label} — у розробці`)}
          >
            <span className="sidebar__item-icon">
              <Icon name={item.icon} size={16} />
            </span>
            <span>{item.label}</span>
            {item.count && (
              <span className="sidebar__item-count" style={{ background: '#3a4628', color: '#dcdfd0' }}>
                {item.count}
              </span>
            )}
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
            <button className="topbar__icon-btn" onClick={() => showToast('Немає нових сповіщень')}>
              <Icon name="bell" size={17} />
            </button>
            <div className="user-chip">
              <span className="user-chip__avatar" style={{ background: '#c98a2e', color: '#1f2614' }}>
                SA
              </span>
              <span>
                <div className="user-chip__name">Платформа · Devs</div>
                <div className="user-chip__role">root</div>
              </span>
            </div>
          </div>
        </header>
        <div className="page">
          <PageHeader
            title="Фонди-клієнти платформи"
            subtitle="Огляд організацій, що користуються системою, та їхніх адміністраторів"
            actions={
              <>
                <button className="btn" onClick={() => showToast('Експорт сформовано')}>
                  <Icon name="download" size={15} />
                  Експорт
                </button>
                <button className="btn btn--primary" onClick={() => setCreateOpen(true)}>
                  <Icon name="plus" size={15} />
                  Створити фонд
                </button>
              </>
            }
          />

          <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="stat">
              <div className="stat__label">Усього фондів</div>
              <div className="stat__value">6</div>
              <div className="stat__sub">+2 за останній місяць</div>
            </div>
            <div className="stat">
              <div className="stat__label">Активних</div>
              <div className="stat__value">3</div>
              <div className="stat__sub">з активним адміністратором</div>
            </div>
            <div className="stat">
              <div className="stat__label">Очікують активації</div>
              <div className="stat__value">2</div>
              <div className="stat__delta stat__delta--warn">не прийняли запрошення</div>
            </div>
            <div className="stat">
              <div className="stat__label">Заблокованих</div>
              <div className="stat__value">1</div>
              <div className="stat__sub">за порушення Terms of Use</div>
            </div>
          </div>

          <div className="table-wrap">
            <div className="table-toolbar">
              <div className="table-search">
                <Icon name="search" size={14} color="var(--text-faint)" />
                <input placeholder="Пошук за фондом, адміністратором, email..." />
              </div>
              <button className="filter-chip">
                <Icon name="filter" size={13} />
                План
                <span className="filter-chip__caret">▾</span>
              </button>
              <button className="filter-chip">
                <Icon name="filter" size={13} />
                Статус
                <span className="filter-chip__caret">▾</span>
              </button>
            </div>
            <table className="data">
              <thead>
                <tr>
                  <th>Назва фонду</th>
                  <th>Адміністратор</th>
                  <th>Статус адміна</th>
                  <th>План</th>
                  <th className="text-right">Користувачів</th>
                  <th className="text-right">Сховище</th>
                  <th>Створено</th>
                  <th style={{ width: 40 }} />
                </tr>
              </thead>
              <tbody>
                {FOUNDATIONS.map((f) => (
                  <tr key={f.id} style={{ cursor: 'default' }}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{f.name}</div>
                      <div className="text-xs muted mono">{f.id}</div>
                    </td>
                    <td>
                      <div>{f.admin}</div>
                      <div className="text-xs muted mono">{f.adminEmail}</div>
                    </td>
                    <td>
                      {f.adminStatus === 'active' && <span className="badge badge--success">активний</span>}
                      {f.adminStatus === 'invited' && <span className="badge badge--new">запрошений</span>}
                      {f.adminStatus === 'blocked' && <span className="badge badge--danger">заблокований</span>}
                    </td>
                    <td>
                      <span className="badge badge--plain">{f.plan}</span>
                    </td>
                    <td className="col-num">{f.users}</td>
                    <td className="col-num">{f.storage}</td>
                    <td className="col-muted">{f.created}</td>
                    <td>
                      <Icon name="chevron-right" size={14} color="var(--text-faint)" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {createOpen && (
        <CreateFoundationModal
          onClose={() => setCreateOpen(false)}
          onCreate={() => {
            setCreateOpen(false)
            showToast('Фонд створено, запрошення надіслано')
          }}
        />
      )}
    </div>
  )
}
