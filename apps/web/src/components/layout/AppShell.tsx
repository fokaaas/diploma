import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../../lib/auth/session'
import { ROLE_LABELS } from '../../data/users'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { ProfileMenu } from './ProfileMenu'
import { SearchPalette } from './SearchPalette'

const routeApi = getRouteApi('/_app')

export function AppShell({ children }: { children: ReactNode }) {
  const { user, role, foundationName, logout } = useAuth()
  const { counts } = routeApi.useLoaderData()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // The `_app` route guard guarantees a session before rendering the shell.
  if (!user || !role) return null

  return (
    <div className="app-shell">
      <Sidebar role={role} foundationName={foundationName ?? ''} counts={counts} />
      <div className="main">
        <TopBar
          user={user}
          roleLabel={ROLE_LABELS[role]}
          foundationName={foundationName ?? ''}
          onProfileClick={() => setProfileOpen(true)}
          onSearchOpen={() => setSearchOpen(true)}
        />
        {children}
      </div>

      {searchOpen && <SearchPalette role={role} onClose={() => setSearchOpen(false)} />}

      {profileOpen && (
        <ProfileMenu
          user={user}
          roleLabel={ROLE_LABELS[role]}
          onClose={() => setProfileOpen(false)}
          onLogout={() => {
            void logout()
            void navigate({ to: '/login' })
          }}
        />
      )}
    </div>
  )
}
