import { useNavigate } from '@tanstack/react-router'
import { useToast } from '../../context/toast-context'
import { COUNTERPARTIES } from '../../data/counterparties'
import { REQUESTS } from '../../data/requests'
import { CONTRIBUTIONS } from '../../data/contributions'
import { getCounterparty } from '../../data/queries'
import { formatNumber } from '../../lib/format'
import { PageHeader } from '../../components/layout/PageHeader'
import { Icon } from '../../components/ui/Icon'

export function ProcurementCreate() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const suppliers = COUNTERPARTIES.filter((c) => c.type === 'supplier')

  const cancel = () => void navigate({ to: '/procurements' })
  const save = () => {
    void navigate({ to: '/procurements' })
    showToast('Закупівлю створено · PR-2026-0302')
  }

  return (
    <div className="page">
      <PageHeader
        breadcrumb={[{ label: 'Закупівлі', onClick: cancel }, { label: 'Нова закупівля' }]}
        title="Створення закупівлі"
        actions={
          <>
            <button className="btn" onClick={cancel}>
              Скасувати
            </button>
            <button className="btn btn--primary" onClick={save}>
              <Icon name="check" size={15} />
              Створити
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
                    Постачальник <span style={{ color: '#c2541e' }}>*</span>
                  </label>
                  <select className="select" defaultValue="">
                    <option value="" disabled>
                      Оберіть...
                    </option>
                    {suppliers.map((s) => (
                      <option key={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Дата</label>
                  <input className="input" type="date" defaultValue="2026-05-26" />
                </div>
              </div>
              <div className="form-row">
                <div className="field">
                  <label>Під заявку</label>
                  <select className="select" defaultValue="">
                    <option value="" disabled>
                      Оберіть заявку...
                    </option>
                    {REQUESTS.map((r) => (
                      <option key={r.id}>
                        {r.id} · {getCounterparty(r.unit)?.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Джерело фінансування</label>
                  <select className="select" multiple style={{ height: 80 }}>
                    {CONTRIBUTIONS.map((c) => (
                      <option key={c.id}>
                        {c.id} · {formatNumber(c.amount)} ₴
                      </option>
                    ))}
                  </select>
                  <div className="field__hint">Можна обрати декілька внесків</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card__header">
              <h3 className="card__title">Позиції</h3>
              <button className="btn btn--sm" onClick={() => showToast('Рядок додано')}>
                <Icon name="plus" size={13} />
                Додати рядок
              </button>
            </div>
            <table className="data">
              <thead>
                <tr>
                  <th>Позиція</th>
                  <th style={{ width: 110 }}>К-сть</th>
                  <th style={{ width: 130 }}>Ціна</th>
                  <th className="text-right">Сума</th>
                  <th style={{ width: 40 }} />
                </tr>
              </thead>
              <tbody>
                {[0, 1].map((row) => (
                  <tr key={row} style={{ cursor: 'default' }}>
                    <td>
                      <input className="input" placeholder={row === 0 ? 'FPV-дрон 7"' : ''} />
                    </td>
                    <td>
                      <input className="input" placeholder={row === 0 ? '0 шт' : '0'} />
                    </td>
                    <td>
                      <input className="input" placeholder="0,00" />
                    </td>
                    <td className="col-num muted">—</td>
                    <td>
                      <button className="btn btn--icon btn--ghost" aria-label="Видалити рядок">
                        <Icon name="trash" size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <div className="note note--info">
            <Icon name="info" size={16} />
            <div>
              Закупівля створиться у статусі <strong>Чернетка</strong>. Після підтвердження та оплати
              ви зможете прийняти товар на склад.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
