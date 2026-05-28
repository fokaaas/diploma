import type { StatusMeta } from '../../types/domain'

interface LifecycleProps<K extends string> {
  steps: K[]
  current: K
  byKey: Record<K, StatusMeta<K>>
}

export function Lifecycle<K extends string>({ steps, current, byKey }: LifecycleProps<K>) {
  const currentIdx = steps.indexOf(current)
  return (
    <div className="lifecycle mb-4">
      {steps.map((key, i) => {
        const cls =
          i < currentIdx
            ? 'lifecycle__step--done'
            : i === currentIdx
              ? 'lifecycle__step--current'
              : ''
        return (
          <div key={key} className={`lifecycle__step ${cls}`}>
            <div className="lifecycle__step-label">{String(i + 1).padStart(2, '0')}</div>
            <div className="lifecycle__step-name">{byKey[key].label}</div>
          </div>
        )
      })}
    </div>
  )
}
