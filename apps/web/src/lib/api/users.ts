import type { Role } from '../../types/domain'
import { apiFetch } from './client'

type BackendRole = 'ADMIN' | 'COORDINATOR' | 'ACCOUNTANT' | 'AUDITOR'
type BackendStatus = 'ACTIVE' | 'INVITED' | 'BLOCKED'

export type UserStatus = 'active' | 'invited' | 'blocked'

interface UserResponse {
  id: string
  fullName: string
  email: string
  role: BackendRole
  status: BackendStatus
  lastSeenAt: string | null
}

export interface AdminUser {
  id: string
  fullName: string
  email: string
  role: Role
  status: UserStatus
  lastSeenAt: string | null
}

export interface InviteUserInput {
  fullName: string
  email: string
  role: Role
  message?: string
}

function toRole(role: BackendRole): Role {
  return role.toLowerCase() as Role
}

function toBackendRole(role: Role): BackendRole {
  return role.toUpperCase() as BackendRole
}

function toUser(response: UserResponse): AdminUser {
  return {
    id: response.id,
    fullName: response.fullName,
    email: response.email,
    role: toRole(response.role),
    status: response.status.toLowerCase() as UserStatus,
    lastSeenAt: response.lastSeenAt,
  }
}

export function listUsers(token: string): Promise<AdminUser[]> {
  return apiFetch<UserResponse[]>('/users', { token }).then((users) =>
    users.map(toUser),
  )
}

export function inviteUser(token: string, input: InviteUserInput): Promise<void> {
  return apiFetch('/users/invitations', {
    method: 'POST',
    body: { ...input, role: toBackendRole(input.role) },
    token,
  }).then(() => undefined)
}

export function changeUserRole(token: string, id: string, role: Role): Promise<void> {
  return apiFetch(`/users/${id}/role`, {
    method: 'PATCH',
    body: { role: toBackendRole(role) },
    token,
  }).then(() => undefined)
}

export function blockUser(token: string, id: string): Promise<void> {
  return apiFetch(`/users/${id}/block`, { method: 'PATCH', token }).then(
    () => undefined,
  )
}

export function unblockUser(token: string, id: string): Promise<void> {
  return apiFetch(`/users/${id}/unblock`, { method: 'PATCH', token }).then(
    () => undefined,
  )
}

export function resendInvitation(token: string, id: string): Promise<void> {
  return apiFetch(`/users/${id}/resend-invitation`, {
    method: 'POST',
    token,
  }).then(() => undefined)
}

export interface Member {
  id: string
  fullName: string
  role: Role
}

export function listMembers(token: string): Promise<Member[]> {
  return apiFetch<{ id: string; fullName: string; role: BackendRole }[]>(
    '/users/members',
    { token },
  ).then((rows) =>
    rows.map((row) => ({ id: row.id, fullName: row.fullName, role: toRole(row.role) })),
  )
}
