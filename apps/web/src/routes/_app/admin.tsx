import { createFileRoute } from '@tanstack/react-router'
import { AdminScreen } from '../../features/admin/AdminScreen'

export const Route = createFileRoute('/_app/admin')({
  component: AdminScreen,
})
