import { createRootRoute, Outlet } from '@tanstack/react-router'
import { ToastProvider } from '../context/toast'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <ToastProvider>
      <Outlet />
    </ToastProvider>
  )
}
