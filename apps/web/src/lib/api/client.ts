export const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  token?: string | null
}


export interface AuthHooks {
  getRefreshToken: () => string | null
  onTokens: (accessToken: string, refreshToken: string) => void
  onAuthFailure: () => void
}

let authHooks: AuthHooks | null = null

export function registerAuthHooks(hooks: AuthHooks): void {
  authHooks = hooks
}

function send(path: string, options: RequestOptions, token: string | null | undefined) {
  const hasBody = options.body !== undefined
  return fetch(`${BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: hasBody ? JSON.stringify(options.body) : undefined,
  })
}

async function callRefresh(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!response.ok) return null
    return (await response.json()) as { accessToken: string; refreshToken: string }
  } catch {
    return null
  }
}

let refreshing: Promise<string | null> | null = null

function refreshAccessToken(): Promise<string | null> {
  if (refreshing) return refreshing
  const hooks = authHooks
  const refreshToken = hooks?.getRefreshToken() ?? null
  if (!hooks || !refreshToken) return Promise.resolve(null)
  refreshing = callRefresh(refreshToken)
    .then((tokens) => {
      if (!tokens) return null
      hooks.onTokens(tokens.accessToken, tokens.refreshToken)
      return tokens.accessToken
    })
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response = await send(path, options, options.token)

  if (
    response.status === 401 &&
    options.token &&
    path !== '/auth/refresh' &&
    authHooks?.getRefreshToken()
  ) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      response = await send(path, options, newToken)
    } else {
      authHooks.onAuthFailure()
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, await extractMessage(response))
  }
  if (response.status === 204) {
    return undefined as T
  }
  return (await response.json()) as T
}

async function extractMessage(response: Response): Promise<string> {
  try {
    const data: unknown = await response.json()
    if (data && typeof data === 'object' && 'message' in data) {
      const message = (data as { message: string | string[] }).message
      return Array.isArray(message) ? message.join(', ') : message
    }
  } catch {
    // fall through to status text
  }
  return response.statusText || 'Помилка запиту'
}
