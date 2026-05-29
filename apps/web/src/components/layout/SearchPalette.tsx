import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { Role } from '../../types/domain'
import { canAccess } from '../../lib/rbac'
import { sessionStore } from '../../lib/auth/session'
import { globalSearch, type SearchResults } from '../../lib/api/search'
import { Icon } from '../ui/Icon'
import type { IconName } from '../ui/Icon'

type GroupKey = keyof SearchResults

interface GroupMeta {
  key: GroupKey
  label: string
  icon: IconName
  path: string
}

const GROUPS: GroupMeta[] = [
  { key: 'requests', label: 'Заявки', icon: 'requests', path: '/requests' },
  { key: 'counterparties', label: 'Контрагенти', icon: 'counterparties', path: '/counterparties' },
  { key: 'contributions', label: 'Благодійні внески', icon: 'contributions', path: '/contributions' },
  { key: 'procurements', label: 'Закупівлі', icon: 'procurements', path: '/procurements' },
]

const EMPTY: SearchResults = {
  requests: [],
  counterparties: [],
  contributions: [],
  procurements: [],
}

export function SearchPalette({ role, onClose }: { role: Role; onClose: () => void }) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(0)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const q = query.trim()
    const token = sessionStore.getAccessToken()
    const handle = setTimeout(() => {
      if (q.length < 2 || !token) {
        setResults(EMPTY)
        return
      }
      setLoading(true)
      globalSearch(token, q)
        .then((data) => {
          setResults(data)
          setSelected(0)
        })
        .catch(() => setResults(EMPTY))
        .finally(() => setLoading(false))
    }, 200)
    return () => clearTimeout(handle)
  }, [query])

  const rows = useMemo(
    () =>
      GROUPS.filter((group) => canAccess(role, group.path)).flatMap((group) =>
        results[group.key].map((hit) => ({ group, hit })),
      ),
    [role, results],
  )

  const go = (group: GroupMeta, id: string) => {
    onClose()
    if (group.key === 'requests') {
      void navigate({ to: '/requests/$requestId', params: { requestId: id } })
    } else if (group.key === 'counterparties') {
      void navigate({ to: '/counterparties/$counterpartyId', params: { counterpartyId: id } })
    } else if (group.key === 'contributions') {
      void navigate({ to: '/contributions/$contributionId', params: { contributionId: id } })
    } else {
      void navigate({ to: '/procurements/$procurementId', params: { procurementId: id } })
    }
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      onClose()
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      setSelected((s) => Math.min(s + 1, rows.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setSelected((s) => Math.max(s - 1, 0))
    } else if (event.key === 'Enter') {
      const row = rows[selected]
      if (row) go(row.group, row.hit.id)
    }
  }

  const showPrompt = query.trim().length < 2
  const showEmpty = !showPrompt && !loading && rows.length === 0

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{ alignItems: 'flex-start', paddingTop: 80 }}
    >
      <div
        className="modal"
        style={{ maxWidth: 560, width: '100%' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 16px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <Icon name="search" size={17} color="var(--text-faint)" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Пошук по заявках, контрагентах, документах..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 'var(--fs-md)',
            }}
          />
          <span className="mono text-xs faint">Esc</span>
        </div>

        <div className="card__body" style={{ maxHeight: '60vh', overflowY: 'auto', padding: 8 }}>
          {showPrompt && (
            <div className="muted text-sm" style={{ padding: '16px 8px' }}>
              Почніть вводити запит (мін. 2 символи)…
            </div>
          )}
          {showEmpty && (
            <div className="muted text-sm" style={{ padding: '16px 8px' }}>
              Нічого не знайдено
            </div>
          )}
          {rows.map((row, index) => {
            const prev = rows[index - 1]
            const showHeader = !prev || prev.group.key !== row.group.key
            const active = index === selected
            return (
              <Fragment key={`${row.group.key}-${row.hit.id}`}>
                {showHeader && (
                  <div
                    className="muted text-xs"
                    style={{ textTransform: 'uppercase', padding: '8px 8px 4px', letterSpacing: 0.4 }}
                  >
                    {row.group.label}
                  </div>
                )}
                <button
                  className="btn btn--ghost"
                  onMouseEnter={() => setSelected(index)}
                  onClick={() => go(row.group, row.hit.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    justifyContent: 'flex-start',
                    background: active ? 'var(--surface-3)' : 'transparent',
                  }}
                >
                  <Icon name={row.group.icon} size={15} color="var(--olive-600)" />
                  <span className="mono">{row.hit.title}</span>
                  <span className="muted text-sm" style={{ marginLeft: 4, textAlign: 'left' }}>
                    {row.hit.subtitle}
                  </span>
                </button>
              </Fragment>
            )
          })}
        </div>
      </div>
    </div>
  )
}
