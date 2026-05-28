import { createFileRoute } from '@tanstack/react-router'
import { SuperAdminScreen } from '../features/super-admin/SuperAdminScreen'

export const Route = createFileRoute('/super-admin')({
  component: SuperAdminScreen,
})
