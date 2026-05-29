import { formatCompactUAH, formatNumber } from '../../lib/format'
import type { PublicReport } from '../../lib/api/reports'
import './public-report.css'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('uk-UA', { dateStyle: 'long' })
}

export function PublicReportPage({ report }: { report: PublicReport | null }) {
  if (!report) {
    return (
      <div className="pubreport">
        <div className="pubreport__hero">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1>Звіт недоступний</h1>
            <p>Публічний звіт не знайдено або посилання недійсне.</p>
          </div>
        </div>
      </div>
    )
  }

  const s = report.snapshot

  return (
    <div className="pubreport">
      <div className="pubreport__nav">
        <div className="pubreport__brand">
          <span className="pubreport__brand-mark">Ф</span>
          <span>{report.foundationName}</span>
        </div>
      </div>

      <div className="pubreport__hero">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.08em', opacity: 0.7 }}>
            Публічний звіт · {formatDate(report.periodStart)} — {formatDate(report.periodEnd)}
          </div>
          <h1>Як ми діяли цього періоду</h1>
          <p>
            Прозорість — фундамент довіри. Нижче — підсумок надходжень, витрат і закритих потреб.
            Кожна цифра у системі підкріплена документами та аудит-трейлом.
          </p>
        </div>
      </div>

      {s.collectedFunds != null && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 32 }}>
          <div className="big-stat">
            <div className="big-stat__label">Зібрано коштів</div>
            <div className="big-stat__value">{formatCompactUAH(s.collectedFunds)}</div>
          </div>
          <div className="big-stat">
            <div className="big-stat__label">Витрачено</div>
            <div className="big-stat__value">{formatCompactUAH(s.spent ?? 0)}</div>
          </div>
          <div className="big-stat">
            <div className="big-stat__label">Залишок коштів</div>
            <div className="big-stat__value">{formatCompactUAH(s.balance ?? 0)}</div>
          </div>
        </div>
      )}

      {s.expenseStructure && s.expenseStructure.length > 0 && (
        <>
          <h2>Структура витрат</h2>
          <div className="bar-chart">
            {s.expenseStructure.map((row) => (
              <div key={row.name} className="bar-chart__row">
                <div className="bar-chart__name">{row.name}</div>
                <div className="bar-chart__track">
                  <div className="bar-chart__fill" style={{ width: `${row.pct}%` }} />
                </div>
                <div className="bar-chart__value">{formatNumber(row.value)} ₴</div>
              </div>
            ))}
          </div>
        </>
      )}

      {s.closedNeeds && s.closedNeeds.length > 0 && (
        <>
          <h2>Закриті потреби підрозділів</h2>
          <div className="closed-needs">
            <table>
              <thead>
                <tr>
                  <th>Підрозділ</th>
                  <th>Напрям</th>
                  <th>Що передано</th>
                  <th style={{ textAlign: 'right' }}>Сума</th>
                </tr>
              </thead>
              <tbody>
                {s.closedNeeds.map((row, i) => (
                  <tr key={i}>
                    <td>
                      <strong>{row.unit}</strong>
                    </td>
                    <td>{row.direction ?? '—'}</td>
                    <td>{row.given}</td>
                    <td style={{ textAlign: 'right' }}>{formatNumber(row.sum)} ₴</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {s.donors && s.donors.length > 0 && (
        <>
          <h2>Дякуємо донорам</h2>
          <div className="donor-list">
            {s.donors.map((d) => (
              <div key={d.name} className="donor-card">
                <div className="donor-card__name">{d.name}</div>
                <div className="donor-card__amount">{formatNumber(d.amount)} ₴</div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="footer-note">
        Усі цифри підтверджуються документами в обліковій системі фонду: платіжними дорученнями,
        актами прийому-передачі, видатковими накладними.
      </div>
    </div>
  )
}
