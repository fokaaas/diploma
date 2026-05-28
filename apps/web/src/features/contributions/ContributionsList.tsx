import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useToast } from '../../context/toast-context'
import { CONTRIBUTIONS } from '../../data/contributions'
import { getCounterparty } from '../../data/queries'
import { formatNumber } from '../../lib/format'
import type { ContributionForm } from '../../types/domain'
import { PageHeader } from '../../components/layout/PageHeader'
import { Icon } from '../../components/ui/Icon'
import { Money } from '../../components/ui/Money'

type FormFilter = 'all' | ContributionForm

export function ContributionsList() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [form, setForm] = useState<FormFilter>('all')
  const filtered = CONTRIBUTIONS.filter((c) => form === 'all' || c.form === form)
  const total = filtered.reduce((sum, c) => sum + c.amount, 0)

  return (
    <div className="page">
      <PageHeader
        title="Благодійні внески"
        subtitle="Облік грошових та натуральних надходжень фонду"
        actions={
          <>
            <button className="btn" onClick={() => showToast('Експорт у бухгалтерію сформовано')}>
              <Icon name="download" size={15} />
              Експорт у бухгалтерію
            </button>
            <button className="btn btn--primary" onClick={() => void navigate({ to: '/contributions/new' })}>
              <Icon name="plus" size={15} />
              Зареєструвати внесок
            </button>
          </>
        }
      />

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat">
          <div className="stat__label">Усього за період</div>
          <div className="stat__value">
            2,30 <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>млн ₴</span>
          </div>
          <div className="stat__delta stat__delta--up">+18% м/м</div>
        </div>
        <div className="stat">
          <div className="stat__label">Грошових</div>
          <div className="stat__value">
            2,26 <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>млн ₴</span>
          </div>
          <div className="stat__sub">7 надходжень</div>
        </div>
        <div className="stat">
          <div className="stat__label">Натуральних</div>
          <div className="stat__value">
            38,5 <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>тис ₴</span>
          </div>
          <div className="stat__sub">1 надходження · оцінка</div>
        </div>
        <div className="stat">
          <div className="stat__label">Залишок невитрачених</div>
          <div className="stat__value">
            412 <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>тис ₴</span>
          </div>
          <div className="stat__sub">в очікуванні закупівель</div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${form === 'all' ? 'tab--active' : ''}`} onClick={() => setForm('all')}>
          Усі <span className="count">{CONTRIBUTIONS.length}</span>
        </button>
        <button className={`tab ${form === 'monetary' ? 'tab--active' : ''}`} onClick={() => setForm('monetary')}>
          Грошові <span className="count">{CONTRIBUTIONS.filter((c) => c.form === 'monetary').length}</span>
        </button>
        <button className={`tab ${form === 'in-kind' ? 'tab--active' : ''}`} onClick={() => setForm('in-kind')}>
          Натуральні <span className="count">{CONTRIBUTIONS.filter((c) => c.form === 'in-kind').length}</span>
        </button>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="table-search">
            <Icon name="search" size={14} color="var(--text-faint)" />
            <input placeholder="Пошук за донором, призначенням, документом..." />
          </div>
          <button className="filter-chip">
            <Icon name="filter" size={13} />
            Донор
            <span className="filter-chip__caret">▾</span>
          </button>
          <button className="filter-chip">
            <Icon name="calendar" size={13} />
            Травень 2026
            <span className="filter-chip__caret">▾</span>
          </button>
          <div style={{ marginLeft: 'auto' }} className="muted text-sm tabular">
            Сума: <strong>{formatNumber(total)} ₴</strong>
          </div>
        </div>
        <table className="data">
          <thead>
            <tr>
              <th>№</th>
              <th>Дата</th>
              <th>Донор</th>
              <th>Форма</th>
              <th>Призначення</th>
              <th>Документ</th>
              <th>Закупівлі</th>
              <th className="text-right">Сума</th>
              <th style={{ width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr
                key={c.id}
                onClick={() =>
                  void navigate({ to: '/contributions/$contributionId', params: { contributionId: c.id } })
                }
              >
                <td className="col-id">{c.id}</td>
                <td className="col-muted">{c.date}</td>
                <td>{getCounterparty(c.donor)?.name}</td>
                <td>
                  {c.form === 'monetary' ? (
                    <span className="badge badge--success">грошовий</span>
                  ) : (
                    <span className="badge badge--violet">натуральний</span>
                  )}
                </td>
                <td>{c.purpose}</td>
                <td className="text-sm muted">{c.doc}</td>
                <td className="col-muted">{c.linkedProc > 0 ? `${c.linkedProc} зак.` : '—'}</td>
                <td className="col-num">
                  <Money value={c.amount} />
                </td>
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
