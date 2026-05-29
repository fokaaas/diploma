import { useRef, useState } from 'react'
import { Icon } from './Icon'

export interface FilterOption {
  value: string
  label: string
}

interface FilterDropdownProps {
  label: string
  options: FilterOption[]
  value: string
  onChange: (value: string) => void
}

const ALL = 'all'

export function FilterDropdown({ label, options, value, onChange }: FilterDropdownProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)

  const active = value !== ALL
  const selectedLabel = options.find((o) => o.value === value)?.label

  const toggle = () => {
    if (position) {
      setPosition(null)
      return
    }
    const rect = buttonRef.current?.getBoundingClientRect()
    if (rect) setPosition({ top: rect.bottom + 4, left: rect.left })
  }

  const pick = (next: string) => {
    setPosition(null)
    onChange(next)
  }

  const items: FilterOption[] = [{ value: ALL, label: 'Усі' }, ...options]

  return (
    <>
      <button
        ref={buttonRef}
        className={`filter-chip ${active ? 'filter-chip--active' : ''}`}
        onClick={toggle}
      >
        <Icon name="filter" size={13} />
        {active && selectedLabel ? `${label}: ${selectedLabel}` : label}
        <span className="filter-chip__caret">▾</span>
      </button>
      {position && (
        <>
          <div onClick={() => setPosition(null)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
          <div
            role="menu"
            style={{
              position: 'fixed',
              top: position.top,
              left: position.left,
              zIndex: 41,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-md)',
              minWidth: 180,
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {items.map((item) => (
              <button
                key={item.value}
                className="btn btn--ghost"
                style={{
                  justifyContent: 'space-between',
                  fontWeight: item.value === value ? 600 : 400,
                }}
                onClick={() => pick(item.value)}
              >
                {item.label}
                {item.value === value && <Icon name="check" size={14} />}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  )
}
