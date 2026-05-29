import { createFileRoute } from '@tanstack/react-router'
import { PlatformLoginScreen } from '../features/auth/PlatformLoginScreen'

export const Route = createFileRoute('/platform-login')({
  component: PlatformLoginScreen,
})
