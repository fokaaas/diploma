import { Modal } from '../../components/ui/Modal'
import { Icon } from '../../components/ui/Icon'

interface IssueModalProps {
  onCancel: () => void
  onConfirm: () => void
}

export function IssueModal({ onCancel, onConfirm }: IssueModalProps) {
  return (
    <Modal
      title="Видача зі складу"
      onClose={onCancel}
      size="lg"
      footer={
        <>
          <button className="btn" onClick={onCancel}>
            Скасувати
          </button>
          <button className="btn btn--primary" onClick={onConfirm}>
            <Icon name="check" size={15} />
            Виконати видачу
          </button>
        </>
      }
    >
      <div className="form-row">
        <div className="field">
          <label>Заявка</label>
          <select className="select">
            <option>R-2026-0146 · 425 ОШБ «Скеля»</option>
            <option>R-2026-0148 · 93 ОМБр</option>
          </select>
          <div className="field__hint">Зміна статусу заявки відбудеться автоматично</div>
        </div>
        <div className="field">
          <label>Дата видачі</label>
          <input className="input" type="date" defaultValue="2026-05-26" />
        </div>
      </div>
      <div className="form-row">
        <div className="field">
          <label>Отримувач</label>
          <input className="input" defaultValue="ст. с-т Дорош М." />
        </div>
        <div className="field">
          <label>Засіб доставки</label>
          <select className="select">
            <option>Авто фонду</option>
            <option>Самовивіз</option>
            <option>Транспортна компанія</option>
          </select>
        </div>
      </div>

      <div className="section-title mt-3">Позиції до видачі</div>
      <table className="data" style={{ border: '1px solid var(--border)', borderRadius: 6 }}>
        <thead>
          <tr>
            <th>Позиція</th>
            <th className="text-right">Залишок</th>
            <th>До видачі</th>
            <th>Локація</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ cursor: 'default' }}>
            <td>Аптечка тактична IFAK</td>
            <td className="col-num">42 шт</td>
            <td>
              <input className="input" defaultValue="20" style={{ width: 90 }} />
            </td>
            <td>
              <span className="muted">Склад · Київ</span>
            </td>
          </tr>
          <tr style={{ cursor: 'default' }}>
            <td>Плитоноска</td>
            <td className="col-num">11 шт</td>
            <td>
              <input className="input" defaultValue="5" style={{ width: 90 }} />
            </td>
            <td>
              <span className="muted">Склад · Київ</span>
            </td>
          </tr>
        </tbody>
      </table>
    </Modal>
  )
}
