import { apiFetch } from './client'

export interface Warehouse {
  id: string
  name: string
}

export function listWarehouses(token: string): Promise<Warehouse[]> {
  return apiFetch<Warehouse[]>('/warehouses', { token })
}
