import { apiFetch } from './client'
import type { TwoFactorChallenge } from './auth'

export interface PlatformAdmin {
  id: string
  name: string
  email: string
}

export interface PlatformSession {
  accessToken: string
  refreshToken: string
  admin: PlatformAdmin
}

export interface FoundationSummary {
  id: string
  name: string
  userCount: number
  adminName?: string
  adminEmail?: string
  adminStatus?: 'ACTIVE' | 'INVITED' | 'BLOCKED'
  createdAt: string
}

export interface CreateFoundationInput {
  legalName: string
  shortName: string
  edrpou: string
  adminFullName: string
  adminEmail: string
}

export function platformLogin(email: string, password: string): Promise<TwoFactorChallenge> {
  return apiFetch<TwoFactorChallenge>('/platform/auth/login', {
    method: 'POST',
    body: { email, password },
  })
}

export function platformSetupTwoFactor(ticket: string, code: string): Promise<PlatformSession> {
  return apiFetch<PlatformSession>('/platform/auth/2fa/setup', {
    method: 'POST',
    body: { ticket, code },
  })
}

export function platformVerifyTwoFactor(ticket: string, code: string): Promise<PlatformSession> {
  return apiFetch<PlatformSession>('/platform/auth/2fa/verify', {
    method: 'POST',
    body: { ticket, code },
  })
}

export function platformLogout(accessToken: string, refreshToken: string): Promise<void> {
  return apiFetch<{ message: string }>('/platform/auth/logout', {
    method: 'POST',
    body: { refreshToken },
    token: accessToken,
  }).then(() => undefined)
}

export function listFoundations(token: string): Promise<FoundationSummary[]> {
  return apiFetch<FoundationSummary[]>('/platform/foundations', { token })
}

export function createFoundation(
  token: string,
  input: CreateFoundationInput,
): Promise<{ id: string; name: string }> {
  return apiFetch<{ id: string; name: string }>('/platform/foundations', {
    method: 'POST',
    body: input,
    token,
  })
}
