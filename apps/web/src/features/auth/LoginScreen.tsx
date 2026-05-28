import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../../lib/auth/session'
import { Icon } from '../../components/ui/Icon'
import { AuthSide } from './AuthSide'

export function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = () => {
    login()
    void navigate({ to: '/' })
  }

  return (
    <div className="auth-wrap">
      <AuthSide />
      <div className="auth-form-side">
        <form
          className="auth-card"
          onSubmit={(event) => {
            event.preventDefault()
            handleLogin()
          }}
        >
          <h1>Вхід до системи</h1>
          <p className="lead">Введіть робочі дані фонду</p>

          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              className="input"
              defaultValue="a.levchenko@sternenko.fund"
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
                defaultValue="0123456789"
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
          <button type="submit" className="btn btn--primary w-full btn--lg" style={{ justifyContent: 'center' }}>
            Увійти
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
