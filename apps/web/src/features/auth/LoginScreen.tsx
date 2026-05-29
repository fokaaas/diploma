import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { login as apiLogin } from '../../lib/api/auth'
import { sessionStore } from '../../lib/auth/session'
import { ApiError } from '../../lib/api/client'
import { Icon } from '../../components/ui/Icon'
import { AuthSide } from './AuthSide'

export function LoginScreen() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setError(null)
    setSubmitting(true)
    try {
      const session = await apiLogin(email, password)
      sessionStore.set(session)
      void navigate({ to: '/' })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не вдалося увійти')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-wrap">
      <AuthSide />
      <div className="auth-form-side">
        <form
          className="auth-card"
          onSubmit={(event) => {
            event.preventDefault()
            void handleSubmit()
          }}
        >
          <h1>Вхід до системи</h1>
          <p className="lead">Введіть робочі дані фонду</p>

          {error && (
            <div className="note note--danger mb-3">
              <Icon name="alert" size={16} />
              <div>{error}</div>
            </div>
          )}

          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ім'я@організація"
            />
          </div>
          <div className="field">
            <label htmlFor="login-password" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Пароль</span>
              <Link to="/forgot-password" style={{ fontWeight: 400, fontSize: 12 }}>
                Забули пароль?
              </Link>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                className="input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ваш пароль"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="btn--icon"
                aria-label={showPassword ? 'Сховати пароль' : 'Показати пароль'}
                style={{
                  position: 'absolute',
                  right: 6,
                  top: 4,
                  background: 'transparent',
                  border: 0,
                  color: 'var(--text-muted)',
                }}
              >
                <Icon name={showPassword ? 'eye-off' : 'eye'} size={16} />
              </button>
            </div>
          </div>
          <label className="checkbox mb-3">
            <input type="checkbox" defaultChecked /> Запам'ятати мене на цьому пристрої
          </label>
          <button
            type="submit"
            className="btn btn--primary w-full btn--lg"
            style={{ justifyContent: 'center' }}
            disabled={submitting}
          >
            {submitting ? 'Вхід…' : 'Увійти'}
          </button>
          <div className="divider" />
          <div className="text-sm muted text-center">
            Запрошення від адміністратора? Скористайтесь посиланням із листа.
          </div>
        </form>
      </div>
    </div>
  )
}
