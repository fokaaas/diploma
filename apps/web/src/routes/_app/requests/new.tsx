import { createFileRoute } from '@tanstack/react-router'
import { RequestCreate } from '../../../features/requests/RequestCreate'

export const Route = createFileRoute('/_app/requests/new')({
  component: RequestCreate,
})
