import { createFileRoute } from '@tanstack/react-router'
import { AdminScreen } from '../../features/admin/AdminScreen'
import { sessionStore } from '../../lib/auth/session'
import { getFoundation, type FoundationProfile } from '../../lib/api/foundation'
import { listUsers, type AdminUser } from '../../lib/api/users'
import {
  listCategories,
  listItems,
  type Category,
  type Item,
} from '../../lib/api/dictionaries'

export interface AdminData {
  foundation: FoundationProfile | null
  users: AdminUser[]
  categories: Category[]
  items: Item[]
}

export const Route = createFileRoute('/_app/admin')({
  loader: async (): Promise<AdminData> => {
    const session = sessionStore.getSnapshot()
    const token = session?.accessToken
    // The `_app` layout renders AccessDenied for non-admins; skip the fetches
    // (which are ADMIN-only) so they don't 403.
    if (!token || session?.user.role !== 'admin') {
      return { foundation: null, users: [], categories: [], items: [] }
    }
    const [foundation, users, categories, items] = await Promise.all([
      getFoundation(token),
      listUsers(token),
      listCategories(token),
      listItems(token),
    ])
    return { foundation, users, categories, items }
  },
  component: AdminScreen,
})
