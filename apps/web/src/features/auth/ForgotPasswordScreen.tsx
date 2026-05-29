import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { forgotPassword } from '../../lib/api/auth'
import { ApiError } from '../../lib/api/client'
import { Icon } from '../../components/ui/Icon'
import { AuthSide } from './AuthSide'

export function ForgotPasswordScreen() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const goToLogin = () => void navigate({ to: '/login' })

  const handleSubmit = async () => {
    setError(null)
    setSubmitting(true)
    try {
      await forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не вдалося надіслати лист')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-wrap">
      <AuthSide subtitle="Відновлюємо доступ обережно. Лист із посиланням надходить лише на адресу, привʼязану до облікового запису у фонді." />
      <div className="auth-form-side">
        <div className="auth-card">
          <button
            className="btn btn--ghost btn--sm mb-3"
            onClick={goToLogin}
            style={{ paddingLeft: 0 }}
          >
            <Icon name="arrow-left" size={14} />
            Назад до входу
          </button>
          {!sent ? (
            <form
              onSubmit={(event) => {
                event.preventDefault()
                void handleSubmit()
              }}
            >
              <h1>Відновлення пароля</h1>
              <p className="lead">
                Вкажіть email, на який буде надіслано посилання для встановлення нового пароля.
              </p>
              {error && (
                <div className="note note--danger mb-3">
                  <Icon name="alert" size={16} />
                  <div>{error}</div>
                </div>
              )}
              <div className="field">
                <label htmlFor="forgot-email">Email</label>
                <input
                  id="forgot-email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ім'я@організація"
                />
              </div>
              <button
                type="submit"
                className="btn btn--primary w-full btn--lg"
                style={{ justifyContent: 'center' }}
                disabled={submitting}
              >
                {submitting ? 'Надсилання…' : 'Надіслати посилання'}
              </button>
            </form>
          ) : (
            <>
              <h1>Перевірте пошту</h1>
              <p className="lead">
                Ми надіслали посилання для скидання пароля. Воно діятиме <strong>2 години</strong>.
              </p>
              <div className="note note--info mb-3">
                <Icon name="mail" size={16} />
                <div>Якщо лист не прийшов протягом 5 хвилин, перевірте папку «Спам».</div>
              </div>
              <button className="btn w-full" onClick={goToLogin} style={{ justifyContent: 'center' }}>
                <Icon name="arrow-left" size={14} />
                Повернутися до входу
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
