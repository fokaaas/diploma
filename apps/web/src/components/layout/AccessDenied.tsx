import { Link } from '@tanstack/react-router'
import { Icon } from '../ui/Icon'

export function AccessDenied() {
  return (
    <div className="page">
      <div className="auth-card" style={{ margin: '40px auto', textAlign: 'center' }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: 'var(--status-danger-bg)',
            color: 'var(--status-danger-fg)',
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto 18px',
          }}
        >
          <Icon name="lock" size={28} />
        </div>
        <h1 style={{ fontSize: 'var(--fs-2xl)', margin: '0 0 6px' }}>Доступ обмежено</h1>
        <p className="lead">Ця секція недоступна для вашої ролі. Зверніться до адміністратора фонду.</p>
        <Link to="/" className="btn btn--primary w-full btn--lg" style={{ justifyContent: 'center' }}>
          Повернутися на дашборд
        </Link>
      </div>
    </div>
  )
}
