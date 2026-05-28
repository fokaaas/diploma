import { PROCUREMENTS } from '../../data/procurements'
import { getProcurement } from '../../data/queries'
import { Modal } from '../../components/ui/Modal'
import { Icon } from '../../components/ui/Icon'

interface ProcurementReceiveModalProps {
  procId: string
  onClose: () => void
  onConfirm: () => void
}

export function ProcurementReceiveModal({ procId, onClose, onConfirm }: ProcurementReceiveModalProps) {
  const procurement = getProcurement(procId) ?? PROCUREMENTS[0]
  return (
    <Modal
      title={`Прийом на склад · ${procurement.id}`}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <button className="btn" onClick={onClose}>
            Скасувати
          </button>
          <button className="btn btn--primary" onClick={onConfirm}>
            <Icon name="check" size={15} />
            Прийняти
          </button>
        </>
      }
    >
      <div className="note note--info mb-3">
        <Icon name="info" size={16} />
        <div>
          При підтвердженні позиції додаються до залишків складу, заявка{' '}
          <strong>{procurement.request}</strong> перейде до статусу «Частково виконана».
        </div>
      </div>
      <table className="data" style={{ border: '1px solid var(--border)', borderRadius: 6 }}>
        <thead>
          <tr>
            <th>Позиція</th>
            <th>Замовлено</th>
            <th>Прийнято</th>
            <th>Склад</th>
            <th>Якість</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ cursor: 'default' }}>
            <td>FPV-дрон 7"</td>
            <td className="col-num">40 шт</td>
            <td>
              <input className="input" defaultValue="40" style={{ width: 90 }} />
            </td>
            <td>
              <select className="select">
                <option>Склад · Київ</option>
                <option>Склад · Дніпро</option>
              </select>
            </td>
            <td>
              <span className="badge badge--success">кондиція</span>
            </td>
          </tr>
        </tbody>
      </table>
    </Modal>
  )
}
