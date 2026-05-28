import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '../../lib/auth/session'
import { Icon } from '../../components/ui/Icon'
import { AuthSide } from './AuthSide'

interface AcceptInvitationScreenProps {
  status: 'new' | 'expired'
}

export function AcceptInvitationScreen({ status }: AcceptInvitationScreenProps) {
  const { login } = useAuth()
  const navigate = useNavigate()

  if (status === 'expired') {
    return (
      <div className="auth-wrap">
        <AuthSide subtitle="Запрошення мають обмежений термін дії з міркувань безпеки." />
        <div className="auth-form-side">
          <div className="auth-card">
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: 'var(--status-danger-bg)',
                color: 'var(--status-danger-fg)',
                display: 'grid',
                placeItems: 'center',
                marginBottom: 18,
              }}
            >
              <Icon name="alert" size={28} />
            </div>
            <h1>Запрошення недійсне</h1>
            <p className="lead">
              Це посилання вже використане або застаріло. Запитайте у вашого адміністратора фонду
              нове запрошення — або надішліть запит автоматично.
            </p>
            <div className="note mb-3">
              <Icon name="info" size={16} />
              <div>
                З моменту створення запрошення минуло <strong>4 доби</strong>. Термін дії — 72
                години.
              </div>
            </div>
            <button
              className="btn btn--primary w-full btn--lg"
              style={{ justifyContent: 'center' }}
              onClick={() => void navigate({ to: '/login' })}
            >
              <Icon name="refresh" size={15} />
              Запитати нове запрошення
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleActivate = () => {
    login('coordinator')
    void navigate({ to: '/' })
  }

  return (
    <div className="auth-wrap">
      <AuthSide subtitle="Ласкаво просимо у фонд. Залишилось лише встановити пароль — і доступ до операційного простору буде відкрито." />
      <div className="auth-form-side">
        <form
          className="auth-card"
          onSubmit={(event) => {
            event.preventDefault()
            handleActivate()
          }}
        >
          <div className="badge badge--plain mb-3" style={{ padding: '4px 12px', fontSize: 12 }}>
            Запрошення від адміністратора
          </div>
          <h1>Привіт, Іване 👋</h1>
          <p className="lead">
            Вас запросили долучитися до фонду <strong>«Спільнота Стерненка»</strong> у ролі{' '}
            <strong>Координатора</strong>.
          </p>

          <div style={{ background: 'var(--surface-2)', borderRadius: 8, padding: 14, marginBottom: 18 }}>
            <div
              className="text-xs muted"
              style={{ textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}
            >
              Облікові дані
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
              <span className="muted text-sm">Email</span>
              <span className="mono">i.doroshenko@sternenko.fund</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
              <span className="muted text-sm">Роль</span>
              <span>Координатор</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
              <span className="muted text-sm">Запросив</span>
              <span>Анастасія Левченко</span>
            </div>
          </div>

          <div className="field">
            <label htmlFor="invite-password">Створіть пароль</label>
            <input id="invite-password" className="input" type="password" placeholder="мінімум 10 символів" />
            <div className="field__hint">мінімум 10 символів · цифри · ВЕЛИКІ та малі літери</div>
          </div>
          <div className="field">
            <label htmlFor="invite-password-confirm">Підтвердіть пароль</label>
            <input id="invite-password-confirm" className="input" type="password" placeholder="повторіть пароль" />
          </div>

          <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  background: i <= 3 ? 'var(--olive-500)' : 'var(--border-strong)',
                }}
              />
            ))}
          </div>
          <div className="text-xs muted mb-3">
            Надійність пароля: <strong style={{ color: '#3d5621' }}>висока</strong>
          </div>

          <label className="checkbox mb-3">
            <input type="checkbox" defaultChecked /> Погоджуюсь з <a href="#">умовами використання</a>{' '}
            та <a href="#">політикою конфіденційності</a>
          </label>
          <button type="submit" className="btn btn--primary w-full btn--lg" style={{ justifyContent: 'center' }}>
            <Icon name="check" size={15} />
            Активувати обліковий запис
          </button>
        </form>
      </div>
    </div>
  )
}
