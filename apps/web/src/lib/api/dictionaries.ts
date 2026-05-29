import { apiFetch } from './client'

export interface Category {
  id: string
  name: string
}

export interface Item {
  id: string
  sku: string
  name: string
  unit: string
  categoryId: string
  categoryName: string
  minStock: number
  lastPrice: number | null
}

export interface CreateItemInput {
  sku: string
  name: string
  unit: string
  categoryId: string
  minStock?: number
  lastPrice?: number
}

export function listCategories(token: string): Promise<Category[]> {
  return apiFetch<Category[]>('/categories', { token })
}

export function createCategory(token: string, name: string): Promise<Category> {
  return apiFetch<Category>('/categories', { method: 'POST', body: { name }, token })
}

export function deleteCategory(token: string, id: string): Promise<void> {
  return apiFetch(`/categories/${id}`, { method: 'DELETE', token }).then(
    () => undefined,
  )
}

export function listItems(token: string): Promise<Item[]> {
  return apiFetch<Item[]>('/items', { token })
}

export function createItem(token: string, input: CreateItemInput): Promise<Item> {
  return apiFetch<Item>('/items', { method: 'POST', body: input, token })
}

export function deleteItem(token: string, id: string): Promise<void> {
  return apiFetch(`/items/${id}`, { method: 'DELETE', token }).then(() => undefined)
}
