import { RequireAuth } from '../lib/auth'
import { DashboardLayout } from '../pages/DashboardLayout'

export default function DashboardRouteLayout() {
  return (
    <RequireAuth>
      <DashboardLayout />
    </RequireAuth>
  )
}
