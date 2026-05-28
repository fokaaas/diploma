import { useState } from 'react'
import { useToast } from '../../context/toast-context'
import { AUDIT } from '../../data/audit'
import { PageHeader } from '../../components/layout/PageHeader'
import { Icon } from '../../components/ui/Icon'
import { Avatar } from '../../components/ui/Avatar'
import { initialsOf } from '../../lib/initials'
import { RelationshipGraph } from '../graph/RelationshipGraph'

export function AuditScreen() {
  const { showToast } = useToast()
  const [graphOpen, setGraphOpen] = useState(false)

  return (
    <div className="page">
      <PageHeader
        title="Аудит та історія операцій"
        subtitle="Read-only журнал усіх змін у системі"
        actions={
          <>
            <button className="btn" onClick={() => setGraphOpen(true)}>
              <Icon name="link" size={15} />
              Граф зв'язків
            </button>
            <button className="btn" onClick={() => showToast('Журнал експортовано')}>
              <Icon name="download" size={15} />
              Експорт журналу
            </button>
          </>
        }
      />

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="table-search">
            <Icon name="search" size={14} color="var(--text-faint)" />
            <input placeholder="Пошук за сутністю, користувачем, дією..." />
          </div>
          <button className="filter-chip">
            <Icon name="filter" size={13} />
            Дія
            <span className="filter-chip__caret">▾</span>
          </button>
          <button className="filter-chip">
            <Icon name="user" size={13} />
            Користувач
            <span className="filter-chip__caret">▾</span>
          </button>
          <button className="filter-chip">
            <Icon name="calendar" size={13} />
            Усі дати
            <span className="filter-chip__caret">▾</span>
          </button>
        </div>
        <table className="data">
          <thead>
            <tr>
              <th style={{ width: 180 }}>Дата і час</th>
              <th>Користувач</th>
              <th>Дія</th>
              <th>Сутність</th>
              <th>Деталі</th>
            </tr>
          </thead>
          <tbody>
            {AUDIT.map((a, i) => (
              <tr key={i} style={{ cursor: 'default' }}>
                <td className="col-muted">{a.date}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar initials={initialsOf(a.user)} color="var(--olive-300)" />
                    <span>{a.user}</span>
                  </div>
                </td>
                <td>{a.action}</td>
                <td>
                  <span className="entity-link">{a.entity}</span>
                </td>
                <td className="text-sm muted">{a.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {graphOpen && <RelationshipGraph rootId="R-2026-0148" onClose={() => setGraphOpen(false)} />}
    </div>
  )
}
