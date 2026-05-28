import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useToast } from '../../context/toast-context'
import { COUNTERPARTIES } from '../../data/counterparties'
import type { BadgeVariant, CounterpartyType } from '../../types/domain'
import { PageHeader } from '../../components/layout/PageHeader'
import { Icon } from '../../components/ui/Icon'

type TypeFilter = 'all' | CounterpartyType

const TYPE_LABEL: Record<CounterpartyType, string> = {
  unit: 'Військовий підрозділ',
  donor: 'Благодійний партнер',
  supplier: 'Постачальник',
}

const TYPE_BADGE: Record<CounterpartyType, BadgeVariant> = {
  unit: 'plain',
  donor: 'success',
  supplier: 'violet',
}

const TABS: { key: TypeFilter; label: string }[] = [
  { key: 'all', label: 'Усі' },
  { key: 'unit', label: 'Військові підрозділи' },
  { key: 'donor', label: 'Благодійні партнери' },
  { key: 'supplier', label: 'Постачальники' },
]

export function CounterpartiesList() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [tab, setTab] = useState<TypeFilter>('all')
  const filtered = COUNTERPARTIES.filter((c) => tab === 'all' || c.type === tab)

  return (
    <div className="page">
      <PageHeader
        title="Контрагенти"
        subtitle="Єдина база партнерів: підрозділи, донори, постачальники"
        actions={
          <>
            <button className="btn" onClick={() => showToast('Експорт сформовано')}>
              <Icon name="download" size={15} />
              Експорт
            </button>
            <button className="btn btn--primary" onClick={() => showToast('Форма нового контрагента незабаром')}>
              <Icon name="plus" size={15} />
              Новий контрагент
            </button>
          </>
        }
      />

      <div className="tabs">
        {TABS.map((t) => {
          const count = t.key === 'all' ? COUNTERPARTIES.length : COUNTERPARTIES.filter((c) => c.type === t.key).length
          return (
            <button key={t.key} className={`tab ${tab === t.key ? 'tab--active' : ''}`} onClick={() => setTab(t.key)}>
              {t.label} <span className="count">{count}</span>
            </button>
          )
        })}
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="table-search">
            <Icon name="search" size={14} color="var(--text-faint)" />
            <input placeholder="Пошук за назвою, контактом, телефоном..." />
          </div>
          <button className="filter-chip">
            <Icon name="filter" size={13} />
            Канал зв'язку
            <span className="filter-chip__caret">▾</span>
          </button>
          <button className="filter-chip">
            <Icon name="filter" size={13} />
            Форма
            <span className="filter-chip__caret">▾</span>
          </button>
          <div style={{ marginLeft: 'auto' }} className="muted text-sm">
            Знайдено: {filtered.length}
          </div>
        </div>
        <table className="data">
          <thead>
            <tr>
              <th>Код</th>
              <th>Назва</th>
              <th>Тип</th>
              <th>Форма</th>
              <th>Контактна особа</th>
              <th>Канал</th>
              <th style={{ width: 80 }} className="col-num">
                Операцій
              </th>
              <th>Остання взаємодія</th>
              <th style={{ width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr
                key={c.id}
                onClick={() =>
                  void navigate({ to: '/counterparties/$counterpartyId', params: { counterpartyId: c.id } })
                }
              >
                <td className="col-id">{c.code}</td>
                <td>
                  <div style={{ fontWeight: 500 }}>{c.name}</div>
                  <div className="text-xs muted">{c.note}</div>
                </td>
                <td>
                  <span className={`badge badge--${TYPE_BADGE[c.type]}`}>{TYPE_LABEL[c.type]}</span>
                </td>
                <td className="col-muted text-sm">{c.form}</td>
                <td>
                  <div>{c.contact}</div>
                  <div className="text-xs muted">{c.phone}</div>
                </td>
                <td className="col-muted">{c.channel}</td>
                <td className="col-num">{c.requests}</td>
                <td className="col-muted">{c.lastInteraction}</td>
                <td>
                  <Icon name="chevron-right" size={14} color="var(--text-faint)" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export { TYPE_LABEL as COUNTERPARTY_TYPE_LABEL }
