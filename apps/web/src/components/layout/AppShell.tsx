import { useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '../../lib/auth/session'
import { ROLE_LABELS } from '../../data/users'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { ProfileMenu } from './ProfileMenu'

export function AppShell({ children }: { children: ReactNode }) {
  const { user, role, foundationName, logout } = useAuth()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)

  // The `_app` route guard guarantees a session before rendering the shell.
  if (!user || !role) return null

  return (
    <div className="app-shell">
      <Sidebar role={role} foundationName={foundationName ?? ''} />
      <div className="main">
        <TopBar
          user={user}
          roleLabel={ROLE_LABELS[role]}
          foundationName={foundationName ?? ''}
          onProfileClick={() => setProfileOpen(true)}
        />
        {children}
      </div>

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
