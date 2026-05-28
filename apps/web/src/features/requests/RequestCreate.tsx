import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useToast } from '../../context/toast-context'
import { COUNTERPARTIES } from '../../data/counterparties'
import { PageHeader } from '../../components/layout/PageHeader'
import { Icon } from '../../components/ui/Icon'

interface LineRow {
  id: number
}

export function RequestCreate() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const units = COUNTERPARTIES.filter((c) => c.type === 'unit')
  const [lines, setLines] = useState<LineRow[]>([{ id: 1 }, { id: 2 }])

  const cancel = () => void navigate({ to: '/requests' })
  const save = () => {
    void navigate({ to: '/requests' })
    showToast('Заявку зареєстровано · R-2026-0149')
  }

  return (
    <div className="page">
      <PageHeader
        breadcrumb={[{ label: 'Заявки', onClick: cancel }, { label: 'Нова заявка' }]}
        title="Створення нової заявки"
        subtitle="Реєстрація потреби від військового підрозділу"
        actions={
          <>
            <button className="btn" onClick={cancel}>
              Скасувати
            </button>
            <button className="btn" onClick={() => showToast('Збережено як чернетку')}>
              Зберегти як чернетку
            </button>
            <button className="btn btn--primary" onClick={save}>
              <Icon name="check" size={15} />
              Зареєструвати
            </button>
          </>
        }
      />

      <div className="detail-grid">
        <div>
          <div className="card mb-4">
            <div className="card__header">
              <h3 className="card__title">Основна інформація</h3>
            </div>
            <div className="card__body">
              <div className="form-row">
                <div className="field">
                  <label>
                    Підрозділ (ініціатор) <span style={{ color: '#c2541e' }}>*</span>
                  </label>
                  <select className="select" defaultValue="">
                    <option value="" disabled>
                      Оберіть підрозділ...
                    </option>
                    {units.map((u) => (
                      <option key={u.id}>{u.name}</option>
                    ))}
                  </select>
                  <div className="field__hint">Контрагент типу «військовий підрозділ»</div>
                </div>
                <div className="field">
                  <label>
                    Координатор від підрозділу <span style={{ color: '#c2541e' }}>*</span>
                  </label>
                  <input className="input" placeholder="ПІБ контактної особи" />
                </div>
              </div>
              <div className="form-row-3">
                <div className="field">
                  <label>Дедлайн</label>
                  <input className="input" type="date" defaultValue="2026-06-04" />
                </div>
                <div className="field">
                  <label>Пріоритет</label>
                  <select className="select" defaultValue="med">
                    <option value="high">Високий</option>
                    <option value="med">Середній</option>
                    <option value="low">Низький</option>
                  </select>
                </div>
                <div className="field">
                  <label>Канал зв'язку</label>
                  <select className="select">
                    <option>Signal</option>
                    <option>Telegram</option>
                    <option>Email</option>
                    <option>Телефон</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card__header">
              <h3 className="card__title">Позиції до забезпечення</h3>
              <button
                className="btn btn--sm"
                onClick={() => setLines((prev) => [...prev, { id: Date.now() }])}
              >
                <Icon name="plus" size={13} />
                Додати рядок
              </button>
            </div>
            <table className="data">
              <thead>
                <tr>
                  <th>Найменування / SKU</th>
                  <th style={{ width: 120 }}>Кількість</th>
                  <th>Технічна вимога</th>
                  <th style={{ width: 40 }} />
                </tr>
              </thead>
              <tbody>
                {lines.map((l) => (
                  <tr key={l.id} style={{ cursor: 'default' }}>
                    <td>
                      <input className="input" placeholder={'напр. FPV-дрон 7"'} />
                    </td>
                    <td>
                      <input className="input" placeholder="0 шт" />
                    </td>
                    <td>
                      <input className="input" placeholder="Частота, спеці, інше" />
                    </td>
                    <td>
                      <button
                        className="btn btn--icon btn--ghost"
                        onClick={() => setLines((prev) => prev.filter((x) => x.id !== l.id))}
                        aria-label="Видалити рядок"
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <div className="card__header">
              <h3 className="card__title">Вкладення</h3>
            </div>
            <div className="card__body">
              <div className="placeholder-img" style={{ padding: '36px 24px' }}>
                <div>
                  <Icon name="upload" size={22} color="var(--text-faint)" />
                </div>
                <div className="mt-2">Перетягніть файли сюди</div>
                <div className="text-xs faint">
                  фото, документи, голосові повідомлення · до 25 МБ
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="card mb-4">
            <div className="card__header">
              <h3 className="card__title">Як це працює</h3>
            </div>
            <div className="card__body">
              <div className="timeline">
                <div className="timeline__item">
                  <span className="timeline__dot" />
                  <div className="timeline__title">1. Заявка → Нова</div>
                  <div className="timeline__body">Реєструєте дані з підрозділу.</div>
                </div>
                <div className="timeline__item">
                  <span className="timeline__dot" />
                  <div className="timeline__title">2. Підтвердження → Підтверджена</div>
                  <div className="timeline__body">
                    Адміністратор/координатор підтверджує та призначає виконавця.
                  </div>
                </div>
                <div className="timeline__item">
                  <span className="timeline__dot" />
                  <div className="timeline__title">3. Закупівлі → В роботі</div>
                  <div className="timeline__body">Створюються пов'язані закупівлі.</div>
                </div>
                <div className="timeline__item">
                  <span className="timeline__dot" />
                  <div className="timeline__title">4. Видача → Виконана / Часткова</div>
                  <div className="timeline__body">Зі складу видається матеріал.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="note note--info">
            <Icon name="info" size={16} />
            <div>
              <strong>Цілісність даних.</strong> Заявка зберігає референс на підрозділ-контрагент.
              Видалити підрозділ із зв'язаними заявками не можна.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
