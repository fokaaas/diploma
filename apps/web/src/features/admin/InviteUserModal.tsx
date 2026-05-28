import { Modal } from '../../components/ui/Modal'
import { Icon } from '../../components/ui/Icon'

interface InviteUserModalProps {
  onClose: () => void
  onSend: () => void
}

export function InviteUserModal({ onClose, onSend }: InviteUserModalProps) {
  return (
    <Modal
      title="Запрошення нового користувача"
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>
            Скасувати
          </button>
          <button className="btn btn--primary" onClick={onSend}>
            <Icon name="send" size={15} />
            Надіслати запрошення
          </button>
        </>
      }
    >
      <div className="form-row">
        <div className="field">
          <label>Імʼя та прізвище</label>
          <input className="input" placeholder="ПІБ" />
        </div>
        <div className="field">
          <label>Email</label>
          <input className="input" placeholder="ім'я@приклад.com" />
        </div>
      </div>
      <div className="field">
        <label>Роль</label>
        <select className="select">
          <option>Координатор</option>
          <option>Бухгалтер</option>
          <option>Аудитор (read-only)</option>
          <option>Адміністратор фонду</option>
        </select>
        <div className="field__hint">Користувач отримає лист із посиланням для встановлення пароля.</div>
      </div>
      <div className="field">
        <label>Особисте повідомлення (необов'язково)</label>
        <textarea className="textarea" placeholder="Кілька слів для майбутнього колеги..." />
      </div>
      <div className="note note--info">
        <Icon name="info" size={16} />
        <div>
          Посилання діятиме <strong>72 години</strong>. Після прийняття запрошення обліковий запис
          автоматично активується.
        </div>
      </div>
    </Modal>
  )
}
