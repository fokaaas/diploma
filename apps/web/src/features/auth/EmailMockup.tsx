import { useNavigate } from '@tanstack/react-router'
import { Modal } from '../../components/ui/Modal'

export function EmailMockup({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  return (
    <Modal
      title="Превʼю листа-запрошення"
      onClose={onClose}
      size="lg"
      footer={
        <button className="btn" onClick={onClose}>
          Закрити
        </button>
      }
    >
      <div style={{ background: '#f4f5f7', padding: 24, borderRadius: 8 }}>
        <div
          style={{
            background: 'white',
            borderRadius: 8,
            overflow: 'hidden',
            maxWidth: 580,
            margin: '0 auto',
            boxShadow: '0 1px 3px rgba(0,0,0,.06)',
          }}
        >
          <div
            style={{
              background: 'var(--olive-600)',
              color: 'var(--text-on-olive)',
              padding: '20px 28px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span
              style={{
                width: 32,
                height: 32,
                background: 'rgba(255,255,255,.14)',
                borderRadius: 7,
                display: 'grid',
                placeItems: 'center',
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              СС
            </span>
            <span style={{ fontWeight: 600 }}>Спільнота Стерненка</span>
          </div>
          <div style={{ padding: '28px 28px 24px' }}>
            <div
              className="text-xs muted"
              style={{ textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}
            >
              Запрошення
            </div>
            <h2 style={{ margin: '0 0 14px', fontSize: 22, letterSpacing: '-0.01em' }}>
              Іване, вас запрошено долучитися до фонду
            </h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
              <strong>Анастасія Левченко</strong> запрошує вас приєднатися до операційної платформи
              фонду <strong>«Спільнота Стерненка»</strong> у ролі <strong>Координатора</strong>.
            </p>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Щоб активувати обліковий запис, відкрийте посилання нижче та встановіть пароль.
              Посилання діятиме <strong>72 години</strong>.
            </p>
            <div
              style={{
                background: 'var(--surface-2)',
                borderRadius: 6,
                padding: 14,
                margin: '18px 0',
                fontSize: 13,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span className="muted">Фонд</span>
                <strong>Спільнота Стерненка</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span className="muted">Email</span>
                <span className="mono">i.doroshenko@sternenko.fund</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span className="muted">Роль</span>
                <span>Координатор</span>
              </div>
            </div>
            <div style={{ textAlign: 'center', margin: '24px 0' }}>
              <button
                className="btn btn--primary btn--lg"
                style={{ padding: '12px 28px' }}
                onClick={() => {
                  onClose()
                  void navigate({ to: '/invite', search: { status: 'new' } })
                }}
              >
                Прийняти запрошення
              </button>
            </div>
            <p className="text-sm muted" style={{ marginTop: 18 }}>
              Якщо кнопка не працює, скопіюйте посилання:
              <br />
              <span className="mono text-xs" style={{ wordBreak: 'break-all' }}>
                https://app.sternenko.fund/invite/a8c2-4f91-...-z9k1
              </span>
            </p>
            <hr style={{ border: 0, borderTop: '1px solid var(--border-soft)', margin: '24px 0' }} />
            <p className="text-xs muted">
              Ви отримали цей лист, бо адміністратор фонду запросив вас до системи. Якщо ви не
              очікували цього запрошення, просто проігноруйте лист.
            </p>
          </div>
          <div
            style={{
              background: 'var(--surface-3)',
              padding: '12px 28px',
              fontSize: 11,
              color: 'var(--text-faint)',
            }}
          >
            © 2026 БО «БФ Спільнота Стерненка». sternenko.fund
          </div>
        </div>
      </div>
    </Modal>
  )
}
