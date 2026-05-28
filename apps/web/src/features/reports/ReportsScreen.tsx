import { useState } from 'react'
import { useToast } from '../../context/toast-context'
import { PageHeader } from '../../components/layout/PageHeader'
import { Icon } from '../../components/ui/Icon'
import { PublicReportPreview } from './PublicReportPreview'

const DIMENSIONS = ['Підрозділ', 'Донор', 'Категорія товару', 'Постачальник', 'Координатор']

const PUBLIC_SECTIONS = [
  { label: 'Сума зібраних коштів', checked: true },
  { label: 'Структура витрат за категоріями', checked: true },
  { label: 'Закриті потреби (за підрозділами)', checked: true },
  { label: 'Список донорів (за згодою)', checked: false },
]

const GENERATED_REPORTS = [
  { name: 'Витрати квітень 2026', period: '01.04 — 30.04.2026', type: 'Внутрішній · XLSX', date: '02 трав. 2026', user: 'Марія Бондарчук', size: '184 КБ', published: false },
  { name: 'Публічний звіт квітень 2026', period: '01.04 — 30.04.2026', type: 'Публічний · HTML/PDF', date: '02 трав. 2026', user: 'Анастасія Левченко', size: '212 КБ', published: true },
  { name: 'Рух ТМЦ за тиждень', period: '19 — 25.05.2026', type: 'Внутрішній · CSV', date: '25 трав. 2026', user: 'Дмитро Кравчук', size: '38 КБ', published: false },
  { name: 'Зведений баланс Q1 2026', period: 'Січ — Бер. 2026', type: 'Внутрішній · PDF', date: '05 квіт. 2026', user: 'Марія Бондарчук', size: '1,2 МБ', published: false },
]

const EXPORT_FORMATS = ['XLSX', 'PDF', 'CSV']

export function ReportsScreen() {
  const { showToast } = useToast()
  const [previewOpen, setPreviewOpen] = useState(false)
  const [format, setFormat] = useState('XLSX')

  return (
    <div className="page">
      <PageHeader
        title="Звітність"
        subtitle="Внутрішні звіти за вимірами та публічна звітність для донорів"
      />

      <div className="grid-2">
        <div className="card">
          <div className="card__header">
            <h3 className="card__title">Конструктор внутрішнього звіту</h3>
          </div>
          <div className="card__body">
            <div className="field">
              <label>Тип звіту</label>
              <select className="select">
                <option>Витрати за період</option>
                <option>Надходження за донорами</option>
                <option>Виконання заявок за підрозділами</option>
                <option>Рух матеріальних цінностей</option>
                <option>Зведений баланс</option>
              </select>
            </div>
            <div className="form-row">
              <div className="field">
                <label>Період з</label>
                <input className="input" type="date" defaultValue="2026-05-01" />
              </div>
              <div className="field">
                <label>по</label>
                <input className="input" type="date" defaultValue="2026-05-31" />
              </div>
            </div>
            <div className="field">
              <label>Розріз</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {DIMENSIONS.map((c) => (
                  <label key={c} className="checkbox">
                    <input type="checkbox" defaultChecked={c === 'Підрозділ' || c === 'Категорія товару'} /> {c}
                  </label>
                ))}
              </div>
            </div>
            <div className="field">
              <label>Формат експорту</label>
              <div className="segmented" style={{ width: 'fit-content' }}>
                {EXPORT_FORMATS.map((f) => (
                  <button key={f} aria-pressed={format === f} onClick={() => setFormat(f)}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <button className="btn btn--primary mt-2" onClick={() => showToast(`Звіт сформовано (${format})`)}>
              <Icon name="download" size={15} />
              Сформувати звіт
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card__header">
            <h3 className="card__title">Публічна звітність</h3>
          </div>
          <div className="card__body">
            <p className="muted" style={{ marginTop: 0 }}>
              Сформувати зведений публічний звіт фонду за період для розміщення на сайті прозорості.
            </p>
            <div className="form-row">
              <div className="field">
                <label>Звітний період з</label>
                <input className="input" type="date" defaultValue="2026-05-01" />
              </div>
              <div className="field">
                <label>по</label>
                <input className="input" type="date" defaultValue="2026-05-31" />
              </div>
            </div>
            <div className="field">
              <label>Розділи звіту</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {PUBLIC_SECTIONS.map((s) => (
                  <label key={s.label} className="checkbox">
                    <input type="checkbox" defaultChecked={s.checked} /> {s.label}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" onClick={() => setPreviewOpen(true)}>
                <Icon name="eye" size={15} />
                Попередній перегляд
              </button>
              <button className="btn btn--primary" onClick={() => showToast('Публічний звіт опубліковано')}>
                <Icon name="globe" size={15} />
                Опублікувати
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="section-title mt-4">Раніше згенеровані звіти</div>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Назва</th>
              <th>Період</th>
              <th>Тип</th>
              <th>Дата формування</th>
              <th>Користувач</th>
              <th>Розмір</th>
              <th style={{ width: 80 }} />
            </tr>
          </thead>
          <tbody>
            {GENERATED_REPORTS.map((r, i) => (
              <tr key={i} style={{ cursor: 'default' }}>
                <td style={{ fontWeight: 500 }}>
                  {r.name}{' '}
                  {r.published && (
                    <span className="badge badge--success" style={{ marginLeft: 8 }}>
                      опубліковано
                    </span>
                  )}
                </td>
                <td className="col-muted">{r.period}</td>
                <td className="col-muted">{r.type}</td>
                <td className="col-muted">{r.date}</td>
                <td>{r.user}</td>
                <td className="col-num text-sm muted">{r.size}</td>
                <td>
                  <button
                    className="btn btn--icon btn--ghost"
                    aria-label="Завантажити"
                    onClick={() => showToast('Звіт завантажено')}
                  >
                    <Icon name="download" size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {previewOpen && <PublicReportPreview onClose={() => setPreviewOpen(false)} />}
    </div>
  )
}
