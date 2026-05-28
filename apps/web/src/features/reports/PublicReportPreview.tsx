import { useNavigate } from '@tanstack/react-router'
import { Modal } from '../../components/ui/Modal'
import { Icon } from '../../components/ui/Icon'

export function PublicReportPreview({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  return (
    <Modal
      title="Попередній перегляд публічного звіту"
      onClose={onClose}
      size="lg"
      footer={
        <>
          <button className="btn" onClick={onClose}>
            Закрити
          </button>
          <button
            className="btn btn--primary"
            onClick={() => {
              onClose()
              void navigate({ to: '/public-report' })
            }}
          >
            <Icon name="globe" size={15} />
            Відкрити публічну сторінку
          </button>
        </>
      }
    >
      <div style={{ background: 'var(--surface-2)', borderRadius: 8, padding: 24 }}>
        <div className="muted text-sm">Спільнота Стерненка · публічний звіт</div>
        <h2 style={{ margin: '6px 0 18px', fontSize: 28, letterSpacing: '-.02em' }}>
          Травень 2026 · як ми діяли
        </h2>
        <div className="grid-3 mb-4">
          <div className="stat" style={{ padding: 14 }}>
            <div className="stat__label">Зібрано</div>
            <div className="stat__value" style={{ fontSize: 22 }}>
              2,30 млн ₴
            </div>
          </div>
          <div className="stat" style={{ padding: 14 }}>
            <div className="stat__label">Витрачено</div>
            <div className="stat__value" style={{ fontSize: 22 }}>
              1,89 млн ₴
            </div>
          </div>
          <div className="stat" style={{ padding: 14 }}>
            <div className="stat__label">Закрито потреб</div>
            <div className="stat__value" style={{ fontSize: 22 }}>
              4 підрозділи
            </div>
          </div>
        </div>
        <div className="muted text-sm">
          Структура витрат, перелік закритих потреб, список донорів — за погодженням.
        </div>
      </div>
    </Modal>
  )
}
