import { useState } from 'react'
import { Icon } from '../../components/ui/Icon'
import type { TwoFactorChallenge } from '../../lib/api/auth'

interface TwoFactorPanelProps {
  challenge: TwoFactorChallenge
  submitting: boolean
  error: string | null
  onSubmit: (code: string) => void
}

export function TwoFactorPanel({ challenge, submitting, error, onSubmit }: TwoFactorPanelProps) {
  const [code, setCode] = useState('')
  const isSetup = challenge.stage === 'SETUP'

  return (
    <form
      className="auth-card"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit(code)
      }}
    >
      <h1>{isSetup ? 'Налаштування двофакторної автентифікації' : 'Двофакторне підтвердження'}</h1>
      <p className="lead">
        {isSetup
          ? 'Відскануйте QR-код у застосунку-автентифікаторі (Google Authenticator, Authy тощо) і введіть 6-значний код для підтвердження.'
          : 'Введіть 6-значний код із застосунку-автентифікатора.'}
      </p>

      {error && (
        <div className="note note--danger mb-3">
          <Icon name="alert" size={16} />
          <div>{error}</div>
        </div>
      )}

      {isSetup && (
        <>
          {challenge.qrDataUrl && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <img
                src={challenge.qrDataUrl}
                alt="QR-код для налаштування двофакторної автентифікації"
                width={184}
                height={184}
                style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
              />
            </div>
          )}
          {challenge.secret && (
            <div className="field">
              <label htmlFor="totp-secret">Або введіть ключ вручну</label>
              <input
                id="totp-secret"
                className="input mono"
                value={challenge.secret}
                readOnly
                onFocus={(event) => event.target.select()}
              />
            </div>
          )}
        </>
      )}

      <div className="field">
        <label htmlFor="totp-code">Код підтвердження</label>
        <input
          id="totp-code"
          className="input"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          autoFocus
        />
      </div>

      <button
        type="submit"
        className="btn btn--primary w-full btn--lg"
        style={{ justifyContent: 'center' }}
        disabled={submitting || code.length !== 6}
      >
        {submitting ? 'Перевірка…' : isSetup ? 'Підтвердити та увійти' : 'Підтвердити'}
      </button>
    </form>
  )
}
