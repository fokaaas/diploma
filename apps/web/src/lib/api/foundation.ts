import { apiFetch } from './client'

export interface FoundationProfile {
  id: string
  name: string
  shortName: string
  legalName: string
  edrpou: string
  taxId: string | null
  address: string | null
  website: string | null
  createdAt: string
}

export function getFoundation(token: string): Promise<FoundationProfile> {
  return apiFetch<FoundationProfile>('/foundation', { token })
}
