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

export interface UpdateFoundationInput {
  legalName: string
  shortName: string
  edrpou: string
  taxId?: string
  address?: string
  website?: string
}

export function getFoundation(token: string): Promise<FoundationProfile> {
  return apiFetch<FoundationProfile>('/foundation', { token })
}

export function updateFoundation(
  token: string,
  input: UpdateFoundationInput,
): Promise<FoundationProfile> {
  return apiFetch<FoundationProfile>('/foundation', {
    method: 'PATCH',
    body: input,
    token,
  })
}
