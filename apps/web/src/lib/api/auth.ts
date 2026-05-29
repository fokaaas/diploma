import type { Role, User } from '../../types/domain'
import { initialsOf } from '../initials'
import { apiFetch } from './client'

type BackendRole = 'ADMIN' | 'COORDINATOR' | 'ACCOUNTANT' | 'AUDITOR'

interface SessionUserResponse {
  id: string
  fullName: string
  email: string
  role: BackendRole
  foundationId: string
  foundationName: string
}

interface AuthSessionResponse {
  accessToken: string
  refreshToken: string
  user: SessionUserResponse
}

interface AuthTokensResponse {
  accessToken: string
  refreshToken: string
}

export interface InvitationInfo {
  state: 'VALID' | 'EXPIRED' | 'USED' | 'NOT_FOUND'
  email?: string
  role?: Role
  foundationName?: string
}

export interface FoundationSession {
  accessToken: string
  refreshToken: string
  user: User
  foundationId: string
  foundationName: string
}

function toRole(role: BackendRole): Role {
  return role.toLowerCase() as Role
}

function toUser(response: SessionUserResponse): User {
  return {
    id: response.id,
    name: response.fullName,
    initials: initialsOf(response.fullName),
    email: response.email,
    role: toRole(response.role),
    status: 'active',
    lastSeen: 'щойно',
  }
}

function toSession(response: AuthSessionResponse): FoundationSession {
  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    user: toUser(response.user),
    foundationId: response.user.foundationId,
    foundationName: response.user.foundationName,
  }
}

export function login(email: string, password: string): Promise<FoundationSession> {
  return apiFetch<AuthSessionResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  }).then(toSession)
}

export function getInvitation(token: string): Promise<InvitationInfo> {
  return apiFetch<{ state: InvitationInfo['state']; email?: string; role?: BackendRole; foundationName?: string }>(
    `/auth/invitations/${encodeURIComponent(token)}`,
  ).then((response) => ({
    state: response.state,
    email: response.email,
    role: response.role ? toRole(response.role) : undefined,
    foundationName: response.foundationName,
  }))
}

export function acceptInvitation(token: string, password: string): Promise<FoundationSession> {
  return apiFetch<AuthSessionResponse>(`/auth/invitations/${encodeURIComponent(token)}/accept`, {
    method: 'POST',
    body: { password },
  }).then(toSession)
}

export function forgotPassword(email: string): Promise<void> {
  return apiFetch<{ message: string }>('/auth/password/forgot', {
    method: 'POST',
    body: { email },
  }).then(() => undefined)
}

export function resetPassword(token: string, password: string): Promise<void> {
  return apiFetch<{ message: string }>('/auth/password/reset', {
    method: 'POST',
    body: { token, password },
  }).then(() => undefined)
}

export function refreshTokens(refreshToken: string): Promise<AuthTokensResponse> {
  return apiFetch<AuthTokensResponse>('/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
  })
}

export function logout(accessToken: string, refreshToken: string): Promise<void> {
  return apiFetch<{ message: string }>('/auth/logout', {
    method: 'POST',
    body: { refreshToken },
    token: accessToken,
  }).then(() => undefined)
}
