import { apiFetch } from './client'

export interface SearchHit {
  id: string
  title: string
  subtitle: string
}

export interface SearchResults {
  requests: SearchHit[]
  counterparties: SearchHit[]
  contributions: SearchHit[]
  procurements: SearchHit[]
}

export function globalSearch(token: string, q: string): Promise<SearchResults> {
  return apiFetch<SearchResults>(`/search?q=${encodeURIComponent(q)}`, { token })
}
