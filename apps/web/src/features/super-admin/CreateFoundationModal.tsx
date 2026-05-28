import { Modal } from '../../components/ui/Modal'
import { Icon } from '../../components/ui/Icon'

interface CreateFoundationModalProps {
  onClose: () => void
  onCreate: () => void
}

export function CreateFoundationModal({ onClose, onCreate }: CreateFoundationModalProps) {
  return (
    <Modal
      title="Створення нового фонду-клієнта"
      onClose={onClose}
      size="lg"
      footer={
        <>
          <button className="btn" onClick={onClose}>
            Скасувати
          </button>
          <button className="btn btn--primary" onClick={onCreate}>
            <Icon name="send" size={15} />
            Створити та надіслати запрошення
          </button>
        </>
      }
    >
      <div className="note note--info mb-3">
        <Icon name="info" size={16} />
        <div>
          Після створення на email майбутнього адміністратора буде надіслано лист-запрошення.
          Обліковий запис створиться в статусі <strong>«Запрошений»</strong> до прийняття
          запрошення.
        </div>
      </div>
      <div className="form-row">
        <div className="field">
          <label>
            Повна назва фонду <span style={{ color: '#c2541e' }}>*</span>
          </label>
          <input className="input" placeholder="Благодійна організація «...»" />
        </div>
        <div className="field">
          <label>Скорочена назва</label>
          <input className="input" placeholder="Для шапки інтерфейсу" />
        </div>
      </div>
      <div className="form-row-3">
        <div className="field">
          <label>Код ЄДРПОУ</label>
          <input className="input" />
        </div>
        <div className="field">
          <label>Країна</label>
          <select className="select">
            <option>Україна</option>
          </select>
        </div>
        <div className="field">
          <label>План</label>
          <select className="select">
            <option>Trial (14 днів)</option>
            <option>Pro</option>
            <option>Enterprise</option>
          </select>
        </div>
      </div>
      <div className="divider" />
      <h4 style={{ margin: '0 0 10px' }}>Перший адміністратор фонду</h4>
      <div className="form-row">
        <div className="field">
          <label>
            ПІБ <span style={{ color: '#c2541e' }}>*</span>
          </label>
          <input className="input" />
        </div>
        <div className="field">
          <label>
            Email <span style={{ color: '#c2541e' }}>*</span>
          </label>
          <input className="input" placeholder="на цю адресу буде надіслано запрошення" />
        </div>
      </div>
    </Modal>
  )
}
