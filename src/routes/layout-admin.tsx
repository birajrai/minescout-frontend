import { RequireAuth } from '../lib/auth'
import { AdminLayout } from '../pages/AdminLayout'

export default function AdminRouteLayout() {
  return (
    <RequireAuth adminOnly>
      <AdminLayout />
    </RequireAuth>
  )
}
