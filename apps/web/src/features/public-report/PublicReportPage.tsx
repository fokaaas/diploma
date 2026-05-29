import { Link } from '@tanstack/react-router'
import './public-report.css'

const SPENDING = [
  { name: 'FPV-дрони та комплектуючі', pct: 42, value: '766 000 ₴' },
  { name: 'РЕБ-обладнання', pct: 20, value: '372 000 ₴' },
  { name: 'Спорядження та амуніція', pct: 11, value: '209 000 ₴' },
  { name: 'Звʼязок (Motorola DP4400e)', pct: 7, value: '138 000 ₴' },
  { name: 'Транспорт (відновлений пікап)', pct: 14, value: '270 000 ₴' },
  { name: 'Інше (енергозабезпечення, медицина)', pct: 6, value: '135 000 ₴' },
]

const CLOSED_NEEDS = [
  { unit: '93 ОМБр «Холодний Яр»', dir: 'сектор Покровськ', given: 'FPV-дрон 7" ×40, АКБ ×120', sum: '766 000 ₴' },
  { unit: '24 ОМБр ім. короля Данила', dir: 'Часів Яр', given: 'РЕБ-модуль ×3, тепловізор ×4', sum: '372 000 ₴' },
  { unit: '425 ОШБ «Скеля»', dir: "Куп'янський напрямок", given: 'Аптечки IFAK ×60, плитоноски ×20', sum: '209 000 ₴' },
  { unit: '37 ОБрМП', dir: 'Запорізький напрямок', given: 'Радіостанції Motorola ×8', sum: '138 000 ₴' },
]

const DONORS = [
  { name: 'ТОВ «Аква-Сіті»', sub: 'партнер з 2024 р.', amount: '1 700 000 ₴' },
  { name: 'Олег Шевченко', sub: 'регулярний донор', amount: '307 000 ₴' },
  { name: 'Громада «Львів-Захід»', sub: 'через парафію', amount: '257 600 ₴' },
  { name: 'Анонімні донори (124 особи)', sub: 'за згодою — без імен', amount: '38 500 ₴' },
]

export function PublicReportPage() {
  return (
    <div className="pubreport">
      <div className="pubreport__nav">
        <div className="pubreport__brand">
          <span className="pubreport__brand-mark">Ф</span>
          <span>Назва фонду</span>
        </div>
        <Link to="/" className="btn">
          До робочого простору →
        </Link>
      </div>

      <div className="pubreport__hero">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.08em', opacity: 0.7 }}>
            Публічний звіт · травень 2026
          </div>
          <h1>Як ми діяли цього місяця</h1>
          <p>
            Прозорість — фундамент довіри. Нижче — повний підсумок надходжень, витрат і закритих
            потреб. Кожна цифра у системі підкріплена документами та аудит-трейлом.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 32 }}>
        <div className="big-stat">
          <div className="big-stat__label">Зібрано коштів</div>
          <div className="big-stat__value">2,30 млн ₴</div>
          <div className="big-stat__sub">+18% до квітня</div>
        </div>
        <div className="big-stat">
          <div className="big-stat__label">Витрачено</div>
          <div className="big-stat__value">1,89 млн ₴</div>
          <div className="big-stat__sub">82% від зібраного</div>
        </div>
        <div className="big-stat">
          <div className="big-stat__label">Закрито потреб</div>
          <div className="big-stat__value">4</div>
          <div className="big-stat__sub">підрозділи / 6 заявок</div>
        </div>
        <div className="big-stat">
          <div className="big-stat__label">Залишок коштів</div>
          <div className="big-stat__value">412 тис ₴</div>
          <div className="big-stat__sub">в очікуванні закупівель</div>
        </div>
      </div>

      <h2>Структура витрат</h2>
      <div className="bar-chart">
        {SPENDING.map((row) => (
          <div key={row.name} className="bar-chart__row">
            <div className="bar-chart__name">{row.name}</div>
            <div className="bar-chart__track">
              <div className="bar-chart__fill" style={{ width: `${row.pct}%` }} />
            </div>
            <div className="bar-chart__value">{row.value}</div>
          </div>
        ))}
      </div>

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
            {CLOSED_NEEDS.map((row) => (
              <tr key={row.unit}>
                <td>
                  <strong>{row.unit}</strong>
                </td>
                <td>{row.dir}</td>
                <td>{row.given}</td>
                <td style={{ textAlign: 'right' }}>{row.sum}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Дякуємо донорам</h2>
      <div className="donor-list">
        {DONORS.map((d) => (
          <div key={d.name} className="donor-card">
            <div className="donor-card__name">{d.name}</div>
            <div className="big-stat__sub">{d.sub}</div>
            <div className="donor-card__amount">{d.amount}</div>
          </div>
        ))}
      </div>

      <div className="footer-note">
        Усі цифри підтверджуються документами в обліковій системі фонду: платіжними дорученнями,
        актами прийому-передачі, видатковими накладними. Повний реєстр операцій за період доступний
        у форматі XLSX за запитом. Перевірити цілісність даних можна через незалежний аудит за
        погодженням.
      </div>

      <div style={{ textAlign: 'center', marginTop: 40, color: 'var(--text-faint)', fontSize: 12 }}>
        Благодійний фонд · ЄДРПОУ XXXXXXXX · Звіт згенеровано 26 травня 2026
      </div>
    </div>
  )
}
