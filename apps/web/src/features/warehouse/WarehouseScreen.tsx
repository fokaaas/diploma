import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useToast } from '../../context/toast-context'
import { ITEMS } from '../../data/items'
import { MOVEMENTS } from '../../data/movements'
import { PageHeader } from '../../components/layout/PageHeader'
import { Icon } from '../../components/ui/Icon'
import { Money } from '../../components/ui/Money'
import { IssueModal } from './IssueModal'

type Tab = 'stock' | 'movements' | 'low'

export function WarehouseScreen({ autoOpenIssue = false }: { autoOpenIssue?: boolean }) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [tab, setTab] = useState<Tab>('stock')
  const [category, setCategory] = useState('all')
  const [issueOpen, setIssueOpen] = useState(autoOpenIssue)

  const categories = ['all', ...new Set(ITEMS.map((i) => i.category))]
  const filtered = ITEMS.filter((i) => category === 'all' || i.category === category)
  const rows = tab === 'low' ? filtered.filter((i) => i.warn) : filtered

  const closeIssue = () => {
    setIssueOpen(false)
    if (autoOpenIssue) void navigate({ to: '/warehouse' })
  }

  return (
    <div className="page">
      <PageHeader
        title="Склад"
        subtitle="Залишки, рух матеріальних цінностей, видача за заявками"
        actions={
          <>
            <button className="btn" onClick={() => setIssueOpen(true)}>
              <Icon name="upload" size={15} />
              Видача за заявкою
            </button>
            <button className="btn btn--primary" onClick={() => showToast('Форма прийому на склад незабаром')}>
              <Icon name="plus" size={15} />
              Прийом на склад
            </button>
          </>
        }
      />

      <div className="tabs">
        <button className={`tab ${tab === 'stock' ? 'tab--active' : ''}`} onClick={() => setTab('stock')}>
          Залишки <span className="count">{ITEMS.length}</span>
        </button>
        <button className={`tab ${tab === 'movements' ? 'tab--active' : ''}`} onClick={() => setTab('movements')}>
          Журнал руху <span className="count">{MOVEMENTS.length}</span>
        </button>
        <button className={`tab ${tab === 'low' ? 'tab--active' : ''}`} onClick={() => setTab('low')}>
          Низькі залишки <span className="count">{ITEMS.filter((i) => i.warn).length}</span>
        </button>
      </div>

      {tab === 'stock' || tab === 'low' ? (
        <div className="table-wrap">
          <div className="table-toolbar">
            <div className="table-search">
              <Icon name="search" size={14} color="var(--text-faint)" />
              <input placeholder="Пошук за назвою, SKU..." />
            </div>
            <select
              className="filter-chip"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ background: category === 'all' ? 'var(--surface)' : 'var(--olive-50)' }}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'all' ? 'Усі категорії' : c}
                </option>
              ))}
            </select>
            <button className="filter-chip">
              <Icon name="warehouse" size={13} />
              Усі склади
              <span className="filter-chip__caret">▾</span>
            </button>
            <div style={{ marginLeft: 'auto' }} className="muted text-sm">
              Знайдено: {rows.length}
            </div>
          </div>
          <table className="data">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Найменування</th>
                <th>Категорія</th>
                <th>Локація</th>
                <th className="text-right">Залишок</th>
                <th className="text-right">Мін.</th>
                <th>Стан</th>
                <th className="text-right">Сер. ціна</th>
                <th style={{ width: 90 }} />
              </tr>
            </thead>
            <tbody>
              {rows.map((i) => (
                <tr key={i.id} onClick={() => void navigate({ to: '/warehouse/$sku', params: { sku: i.sku } })}>
                  <td className="col-id">{i.sku}</td>
                  <td style={{ fontWeight: 500 }}>{i.name}</td>
                  <td className="col-muted">{i.category}</td>
                  <td className="col-muted">{i.location}</td>
                  <td className="col-num">
                    <strong>{i.stock}</strong> <span className="muted">{i.unit}</span>
                  </td>
                  <td className="col-num muted">{i.minStock}</td>
                  <td>
                    {i.warn ? (
                      <span className="badge badge--warning">низький</span>
                    ) : i.stock > i.minStock * 1.5 ? (
                      <span className="badge badge--success">норма</span>
                    ) : (
                      <span className="badge badge--plain">достатньо</span>
                    )}
                  </td>
                  <td className="col-num">
                    <Money value={i.lastPrice} />
                  </td>
                  <td>
                    <button
                      className="btn btn--sm btn--ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        setIssueOpen(true)
                      }}
                    >
                      Видача
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-wrap">
          <div className="table-toolbar">
            <div className="table-search">
              <Icon name="search" size={14} color="var(--text-faint)" />
              <input placeholder="Пошук за позицією, документом..." />
            </div>
            <button className="filter-chip">
              <Icon name="filter" size={13} />
              Тип: усі
              <span className="filter-chip__caret">▾</span>
            </button>
            <button className="filter-chip">
              <Icon name="calendar" size={13} />
              Травень 2026
              <span className="filter-chip__caret">▾</span>
            </button>
          </div>
          <table className="data">
            <thead>
              <tr>
                <th>№</th>
                <th>Дата</th>
                <th>Тип</th>
                <th>Позиція</th>
                <th className="text-right">К-сть</th>
                <th>Документ-основа</th>
                <th>Користувач</th>
              </tr>
            </thead>
            <tbody>
              {MOVEMENTS.map((m) => (
                <tr key={m.id} style={{ cursor: 'default' }}>
                  <td className="col-id">{m.id}</td>
                  <td className="col-muted">{m.date}</td>
                  <td>
                    {m.type === 'in' ? (
                      <span className="badge badge--success">прийом</span>
                    ) : (
                      <span className="badge badge--warning">видача</span>
                    )}
                  </td>
                  <td>{m.item}</td>
                  <td className="col-num">
                    {m.type === 'in' ? '+' : '−'}
                    {m.qty}
                  </td>
                  <td>
                    <span className="entity-link">{m.source}</span>
                  </td>
                  <td className="col-muted">{m.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {issueOpen && (
        <IssueModal
          onCancel={closeIssue}
          onConfirm={() => {
            closeIssue()
            showToast('Видачу виконано')
          }}
        />
      )}
    </div>
  )
}
