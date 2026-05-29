import { apiFetch } from './client'

export interface NavCounts {
  requests: number
  procurements: number
}

export function getNavCounts(token: string): Promise<NavCounts> {
  return apiFetch<NavCounts>('/nav/counts', { token })
}
