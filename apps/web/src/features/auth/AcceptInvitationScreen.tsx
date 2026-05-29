import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { acceptInvitation, getInvitation, type InvitationInfo } from '../../lib/api/auth'
import { sessionStore } from '../../lib/auth/session'
import { ApiError } from '../../lib/api/client'
import { ROLE_LABELS } from '../../data/users'
import { Icon } from '../../components/ui/Icon'
import { AuthSide } from './AuthSide'

export function AcceptInvitationScreen({ token }: { token: string }) {
  const navigate = useNavigate()
  const [info, setInfo] = useState<InvitationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    getInvitation(token)
      .then((result) => active && setInfo(result))
      .catch(() => active && setInfo({ state: 'NOT_FOUND' }))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [token])

  const handleActivate = async () => {
    setError(null)
    if (password.length < 10) {
      setError('Пароль повинен містити щонайменше 10 символів')
      return
    }
    if (password !== confirm) {
      setError('Паролі не збігаються')
      return
    }
    setSubmitting(true)
    try {
      const session = await acceptInvitation(token, password)
      sessionStore.set(session)
      void navigate({ to: '/' })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не вдалося активувати акаунт')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="auth-wrap">
        <AuthSide />
        <div className="auth-form-side">
          <div className="auth-card">
            <p className="lead">Перевіряємо запрошення…</p>
          </div>
        </div>
      </div>
    )
  }

  if (!info || info.state !== 'VALID') {
    const message =
      info?.state === 'USED'
        ? 'Це запрошення вже використане. Спробуйте увійти у систему.'
        : 'Це посилання застаріло або недійсне. Запитайте у вашого адміністратора фонду нове запрошення.'
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
            <p className="lead">{message}</p>
            <button
              className="btn btn--primary w-full btn--lg"
              style={{ justifyContent: 'center' }}
              onClick={() => void navigate({ to: '/login' })}
            >
              <Icon name="arrow-left" size={15} />
              До входу
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-wrap">
      <AuthSide subtitle="Ласкаво просимо у фонд. Залишилось лише встановити пароль — і доступ до операційного простору буде відкрито." />
      <div className="auth-form-side">
        <form
          className="auth-card"
          onSubmit={(event) => {
            event.preventDefault()
            void handleActivate()
          }}
        >
          <div className="badge badge--plain mb-3" style={{ padding: '4px 12px', fontSize: 12 }}>
            Запрошення від адміністратора
          </div>
          <h1>Вітаємо 👋</h1>
          <p className="lead">
            Вас запросили долучитися до фонду <strong>«{info.foundationName}»</strong>
            {info.role ? (
              <>
                {' '}
                у ролі <strong>{ROLE_LABELS[info.role]}</strong>
              </>
            ) : null}
            .
          </p>

          <div style={{ background: 'var(--surface-2)', borderRadius: 8, padding: 14, marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span className="muted text-sm">Email</span>
              <span className="mono">{info.email}</span>
            </div>
            {info.role && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span className="muted text-sm">Роль</span>
                <span>{ROLE_LABELS[info.role]}</span>
              </div>
            )}
          </div>

          {error && (
            <div className="note note--danger mb-3">
              <Icon name="alert" size={16} />
              <div>{error}</div>
            </div>
          )}

          <div className="field">
            <label htmlFor="invite-password">Створіть пароль</label>
            <input
              id="invite-password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="мінімум 10 символів"
            />
            <div className="field__hint">мінімум 10 символів · цифри · літери</div>
          </div>
          <div className="field">
            <label htmlFor="invite-password-confirm">Підтвердіть пароль</label>
            <input
              id="invite-password-confirm"
              className="input"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="повторіть пароль"
            />
          </div>

          <button
            type="submit"
            className="btn btn--primary w-full btn--lg"
            style={{ justifyContent: 'center' }}
            disabled={submitting}
          >
            <Icon name="check" size={15} />
            {submitting ? 'Активація…' : 'Активувати обліковий запис'}
          </button>
        </form>
      </div>
    </div>
  )
}
