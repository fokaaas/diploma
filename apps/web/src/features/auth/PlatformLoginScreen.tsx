import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  platformLogin,
  platformSetupTwoFactor,
  platformVerifyTwoFactor,
} from '../../lib/api/platform'
import { platformSessionStore } from '../../lib/auth/platform-session'
import { ApiError } from '../../lib/api/client'
import type { TwoFactorChallenge } from '../../lib/api/auth'
import { Icon } from '../../components/ui/Icon'
import { AuthSide } from './AuthSide'
import { TwoFactorPanel } from './TwoFactorPanel'

export function PlatformLoginScreen() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [challenge, setChallenge] = useState<TwoFactorChallenge | null>(null)

  const handleSubmit = async () => {
    setError(null)
    setSubmitting(true)
    try {
      setChallenge(await platformLogin(email, password))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не вдалося увійти')
    } finally {
      setSubmitting(false)
    }
  }

  const handleTwoFactor = async (code: string) => {
    if (!challenge) return
    setError(null)
    setSubmitting(true)
    try {
      const session =
        challenge.stage === 'SETUP'
          ? await platformSetupTwoFactor(challenge.ticket, code)
          : await platformVerifyTwoFactor(challenge.ticket, code)
      platformSessionStore.set(session)
      void navigate({ to: '/super-admin' })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не вдалося підтвердити код')
    } finally {
      setSubmitting(false)
    }
  }

  if (challenge) {
    return (
      <div className="auth-wrap">
        <AuthSide subtitle="Панель платформи для керування фондами-клієнтами та їхніми адміністраторами." />
        <div className="auth-form-side">
          <TwoFactorPanel
            challenge={challenge}
            submitting={submitting}
            error={error}
            onSubmit={(code) => void handleTwoFactor(code)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="auth-wrap">
      <AuthSide subtitle="Панель платформи для керування фондами-клієнтами та їхніми адміністраторами." />
      <div className="auth-form-side">
        <form
          className="auth-card"
          onSubmit={(event) => {
            event.preventDefault()
            void handleSubmit()
          }}
        >
          <div className="badge badge--plain mb-3" style={{ padding: '4px 12px', fontSize: 12 }}>
            Super-Admin платформи
          </div>
          <h1>Вхід до панелі платформи</h1>
          <p className="lead">Доступ лише для операторів платформи</p>

          {error && (
            <div className="note note--danger mb-3">
              <Icon name="alert" size={16} />
              <div>{error}</div>
            </div>
          )}

          <div className="field">
            <label htmlFor="platform-email">Email</label>
            <input
              id="platform-email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="root@platform.local"
            />
          </div>
          <div className="field">
            <label htmlFor="platform-password">Пароль</label>
            <input
              id="platform-password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="btn btn--primary w-full btn--lg"
            style={{ justifyContent: 'center' }}
            disabled={submitting}
          >
            {submitting ? 'Вхід…' : 'Увійти'}
          </button>
        </form>
      </div>
    </div>
  )
}
