import { useSyncExternalStore } from 'react'
import type { Role, User } from '../../types/domain'
import type { FoundationSession } from '../api/auth'
import { logout as apiLogout } from '../api/auth'

const STORAGE_KEY = 'fund-platform.session'

let session: FoundationSession | null = loadInitial()
const listeners = new Set<() => void>()

function loadInitial(): FoundationSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as FoundationSession) : null
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
  getSnapshot(): FoundationSession | null {
    return session
  },
  set(next: FoundationSession): void {
    session = next
    persist()
    emit()
  },
  clear(): void {
    session = null
    persist()
    emit()
  },
  getAccessToken(): string | null {
    return session?.accessToken ?? null
  },
  isAuthenticated(): boolean {
    return session !== null
  },
}

async function performLogout(): Promise<void> {
  const current = session
  sessionStore.clear()
  if (current) {
    try {
      await apiLogout(current.accessToken, current.refreshToken)
    } catch {
      // best-effort server-side revocation; local session is already cleared
    }
  }
}

export interface AuthState {
  session: FoundationSession | null
  isAuthenticated: boolean
  role: Role | null
  user: User | null
  foundationName: string | null
  logout: () => Promise<void>
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
    role: current?.user.role ?? null,
    user: current?.user ?? null,
    foundationName: current?.foundationName ?? null,
    logout: performLogout,
  }
}
