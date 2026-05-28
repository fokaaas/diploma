import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useToast } from '../../context/toast-context'
import { COUNTERPARTIES } from '../../data/counterparties'
import type { ContributionForm } from '../../types/domain'
import { PageHeader } from '../../components/layout/PageHeader'
import { Icon } from '../../components/ui/Icon'

export function ContributionCreate() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [form, setForm] = useState<ContributionForm>('monetary')
  const donors = COUNTERPARTIES.filter((c) => c.type === 'donor')

  const cancel = () => void navigate({ to: '/contributions' })
  const save = () => {
    void navigate({ to: '/contributions' })
    showToast('Внесок зареєстровано')
  }

  return (
    <div className="page">
      <PageHeader
        breadcrumb={[{ label: 'Внески', onClick: cancel }, { label: 'Реєстрація' }]}
        title="Реєстрація благодійного внеску"
        actions={
          <>
            <button className="btn" onClick={cancel}>
              Скасувати
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
                    Донор <span style={{ color: '#c2541e' }}>*</span>
                  </label>
                  <select className="select" defaultValue="">
                    <option value="" disabled>
                      Оберіть донора...
                    </option>
                    {donors.map((d) => (
                      <option key={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>
                    Дата надходження <span style={{ color: '#c2541e' }}>*</span>
                  </label>
                  <input className="input" type="date" defaultValue="2026-05-26" />
                </div>
              </div>

              <div className="field">
                <label>
                  Форма внеску <span style={{ color: '#c2541e' }}>*</span>
                </label>
                <div className="segmented" style={{ width: 'fit-content' }}>
                  <button aria-pressed={form === 'monetary'} onClick={() => setForm('monetary')}>
                    Грошовий
                  </button>
                  <button aria-pressed={form === 'in-kind'} onClick={() => setForm('in-kind')}>
                    Натуральний
                  </button>
                </div>
              </div>

              {form === 'monetary' ? (
                <div className="form-row">
                  <div className="field">
                    <label>
                      Сума, ₴ <span style={{ color: '#c2541e' }}>*</span>
                    </label>
                    <input className="input" placeholder="0,00" />
                  </div>
                  <div className="field">
                    <label>Валюта</label>
                    <select className="select">
                      <option>UAH (гривня)</option>
                      <option>USD</option>
                      <option>EUR</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="form-row-3">
                  <div className="field">
                    <label>
                      Позиція <span style={{ color: '#c2541e' }}>*</span>
                    </label>
                    <input className="input" placeholder="напр. Аптечка IFAK" />
                  </div>
                  <div className="field">
                    <label>Кількість</label>
                    <input className="input" placeholder="0" />
                  </div>
                  <div className="field">
                    <label>Оцінка вартості, ₴</label>
                    <input className="input" placeholder="0,00" />
                  </div>
                </div>
              )}

              <div className="field">
                <label>Призначення</label>
                <input className="input" placeholder="Цільове призначення внеску, якщо є" />
              </div>
              <div className="field">
                <label>Документ-основа</label>
                <input className="input" placeholder="Платіжне доручення №..., Акт прийому №..." />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <h3 className="card__title">Документи</h3>
            </div>
            <div className="card__body">
              <div className="placeholder-img" style={{ padding: 32 }}>
                <Icon name="upload" size={22} color="var(--text-faint)" />
                <div className="mt-2">Завантажте сканкопію документа</div>
                <div className="text-xs faint">PDF / JPG / PNG · до 25 МБ</div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="note note--info mb-4">
            <Icon name="info" size={16} />
            <div>
              Один внесок може фінансувати <strong>декілька закупівель</strong>. Зв'язок
              встановлюється при створенні закупівлі.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
