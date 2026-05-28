interface AuthSideProps {
  subtitle?: string
}

export function AuthSide({ subtitle }: AuthSideProps) {
  return (
    <div className="auth-side">
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              width: 36,
              height: 36,
              background: 'rgba(255,255,255,.14)',
              borderRadius: 8,
              display: 'grid',
              placeItems: 'center',
              fontWeight: 700,
            }}
          >
            СС
          </span>
          <span style={{ fontWeight: 600, fontSize: 17, letterSpacing: '-0.01em' }}>
            Спільнота Стерненка
          </span>
        </div>
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            fontSize: 'var(--fs-xs)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            opacity: 0.65,
            marginBottom: 14,
          }}
        >
          Операційна платформа фонду
        </div>
        <h2
          style={{
            fontSize: 38,
            fontWeight: 600,
            lineHeight: 1.1,
            margin: '0 0 16px',
            letterSpacing: '-0.02em',
          }}
        >
          Єдине джерело правди
          <br />
          про потреби, кошти, склад і доставку.
        </h2>
        <p style={{ opacity: 0.78, maxWidth: 460, fontSize: 15, lineHeight: 1.5 }}>
          {subtitle ??
            'Замість десятка чатів і таблиць — один реєстр з повним аудитом та розмежуванням ролей.'}
        </p>
      </div>
      <div style={{ position: 'relative', zIndex: 1, opacity: 0.6, fontSize: 12 }}>
        v1.0 · © 2026 · sternenko.fund
      </div>
    </div>
  )
}
