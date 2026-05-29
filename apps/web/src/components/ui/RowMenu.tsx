import { useRef, useState } from 'react'
import { Icon } from './Icon'

export interface RowMenuItem {
  label: string
  onClick: () => void
  danger?: boolean
}

interface RowMenuProps {
  items: RowMenuItem[]
  label?: string
}

export function RowMenu({ items, label = 'Дії' }: RowMenuProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState<{ top: number; right: number } | null>(null)

  const toggle = () => {
    if (position) {
      setPosition(null)
      return
    }
    const rect = buttonRef.current?.getBoundingClientRect()
    if (rect) {
      setPosition({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
    }
  }

  return (
    <>
      <button
        ref={buttonRef}
        className="btn btn--icon btn--ghost"
        aria-label={label}
        onClick={toggle}
      >
        <Icon name="more" size={14} />
      </button>
      {position && (
        <>
          <div
            onClick={() => setPosition(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
          />
          <div
            role="menu"
            style={{
              position: 'fixed',
              top: position.top,
              right: position.right,
              zIndex: 41,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-md)',
              minWidth: 220,
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {items.map((item) => (
              <button
                key={item.label}
                className="btn btn--ghost"
                style={{
                  justifyContent: 'flex-start',
                  color: item.danger ? '#8a2c1e' : undefined,
                }}
                onClick={() => {
                  setPosition(null)
                  item.onClick()
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  )
}
