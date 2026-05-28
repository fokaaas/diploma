import { useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '../../lib/auth/session'
import { ROLE_LABELS } from '../../data/users'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { ProfileMenu } from './ProfileMenu'

export function AppShell({ children }: { children: ReactNode }) {
  const { user, role, setRole, logout } = useAuth()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)

  // The `_app` route guard guarantees a session before rendering the shell.
  if (!user || !role) return null

  return (
    <div className="app-shell">
      <Sidebar role={role} onRoleChange={setRole} />
      <div className="main">
        <TopBar
          user={user}
          roleLabel={ROLE_LABELS[role]}
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
            logout()
            void navigate({ to: '/login' })
          }}
        />
      )}
    </div>
  )
}
