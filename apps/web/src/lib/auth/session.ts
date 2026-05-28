import { useSyncExternalStore } from 'react'
import type { Role, User } from '../../types/domain'
import { CURRENT_USER } from '../../data/users'

export interface Session {
  user: User
  role: Role
}

const STORAGE_KEY = 'sternenko.session'

let session: Session | null = loadInitial()
const listeners = new Set<() => void>()

function loadInitial(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

function persist(): void {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // localStorage may be unavailable (private mode) — state still works in memory.
  }
}

function emit(): void {
  for (const listener of listeners) listener()
}

export const sessionStore = {
  subscribe(callback: () => void): () => void {
    listeners.add(callback)
    return () => {
      listeners.delete(callback)
    }
  },
  getSnapshot(): Session | null {
    return session
  },
  login(role: Role = CURRENT_USER.role): void {
    session = { user: CURRENT_USER, role }
    persist()
    emit()
  },
  logout(): void {
    session = null
    persist()
    emit()
  },
  isAuthenticated(): boolean {
    return session !== null
  },
}

export interface AuthState {
  session: Session | null
  isAuthenticated: boolean
  role: Role | null
  user: User | null
  login: (role?: Role) => void
  logout: () => void
}

export function useAuth(): AuthState {
  const current = useSyncExternalStore(
    sessionStore.subscribe,
    sessionStore.getSnapshot,
    () => null,
  )
  return {
    session: current,
    isAuthenticated: current !== null,
    role: current?.role ?? null,
    user: current?.user ?? null,
    login: sessionStore.login,
    logout: sessionStore.logout,
  }
}
