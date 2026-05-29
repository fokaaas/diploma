import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { resetPassword } from '../../lib/api/auth'
import { ApiError } from '../../lib/api/client'
import { Icon } from '../../components/ui/Icon'
import { AuthSide } from './AuthSide'

export function ResetPasswordScreen({ token }: { token: string }) {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
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
      await resetPassword(token, password)
      setDone(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не вдалося оновити пароль')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-wrap">
      <AuthSide subtitle="Встановіть новий пароль для вашого облікового запису." />
      <div className="auth-form-side">
        <div className="auth-card">
          {done ? (
            <>
              <h1>Пароль оновлено</h1>
              <p className="lead">Тепер ви можете увійти з новим паролем.</p>
              <button
                className="btn btn--primary w-full btn--lg"
                style={{ justifyContent: 'center' }}
                onClick={() => void navigate({ to: '/login' })}
              >
                Перейти до входу
              </button>
            </>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault()
                void handleSubmit()
              }}
            >
              <h1>Новий пароль</h1>
              <p className="lead">Вкажіть новий пароль для входу в систему.</p>
              {!token && (
                <div className="note note--danger mb-3">
                  <Icon name="alert" size={16} />
                  <div>Відсутній токен відновлення. Скористайтесь посиланням із листа.</div>
                </div>
              )}
              {error && (
                <div className="note note--danger mb-3">
                  <Icon name="alert" size={16} />
                  <div>{error}</div>
                </div>
              )}
              <div className="field">
                <label htmlFor="reset-password">Новий пароль</label>
                <input
                  id="reset-password"
                  className="input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="мінімум 10 символів"
                />
              </div>
              <div className="field">
                <label htmlFor="reset-confirm">Підтвердіть пароль</label>
                <input
                  id="reset-confirm"
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
                disabled={submitting || !token}
              >
                {submitting ? 'Збереження…' : 'Встановити пароль'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
