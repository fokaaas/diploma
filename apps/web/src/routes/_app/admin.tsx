import { createFileRoute } from '@tanstack/react-router'
import { AdminScreen } from '../../features/admin/AdminScreen'
import { sessionStore } from '../../lib/auth/session'
import { getFoundation, type FoundationProfile } from '../../lib/api/foundation'

export const Route = createFileRoute('/_app/admin')({
  loader: (): Promise<FoundationProfile | null> => {
    const token = sessionStore.getAccessToken()
    return token ? getFoundation(token) : Promise.resolve(null)
  },
  component: AdminScreen,
})
