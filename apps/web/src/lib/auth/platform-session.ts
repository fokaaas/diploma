import { useSyncExternalStore } from 'react'
import type { PlatformAdmin, PlatformSession } from '../api/platform'
import { platformLogout } from '../api/platform'

const STORAGE_KEY = 'fund-platform.platform-session'

let session: PlatformSession | null = loadInitial()
const listeners = new Set<() => void>()

function loadInitial(): PlatformSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PlatformSession) : null
  } catch {
    return null
  }
}

function persist(): void {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore unavailable storage
  }
}

function emit(): void {
  for (const listener of listeners) listener()
}

export const platformSessionStore = {
  subscribe(callback: () => void): () => void {
    listeners.add(callback)
    return () => {
      listeners.delete(callback)
    }
  },
  getSnapshot(): PlatformSession | null {
    return session
  },
  set(next: PlatformSession): void {
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
  platformSessionStore.clear()
  if (current) {
    try {
      await platformLogout(current.accessToken, current.refreshToken)
    } catch {
      // best-effort revocation
    }
  }
}

export interface PlatformAuthState {
  admin: PlatformAdmin | null
  isAuthenticated: boolean
  accessToken: string | null
  logout: () => Promise<void>
}

export function usePlatformAuth(): PlatformAuthState {
  const current = useSyncExternalStore(
    platformSessionStore.subscribe,
    platformSessionStore.getSnapshot,
    () => null,
  )
  return {
    admin: current?.admin ?? null,
    isAuthenticated: current !== null,
    accessToken: current?.accessToken ?? null,
    logout: performLogout,
  }
}
