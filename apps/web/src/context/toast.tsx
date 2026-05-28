import { useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import { Icon } from '../components/ui/Icon'
import { ToastContext } from './toast-context'

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)

  const showToast = useCallback((next: string) => {
    setMessage(next)
    window.setTimeout(() => setMessage(null), 2400)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message && <Toast message={message} />}
    </ToastContext.Provider>
  )
}

function Toast({ message }: { message: string }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--olive-800)',
        color: 'var(--text-on-olive)',
        padding: '10px 20px',
        borderRadius: 999,
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        zIndex: 200,
        fontSize: 'var(--fs-md)',
      }}
    >
      <Icon name="check" size={16} />
      {message}
    </div>
  )
}
