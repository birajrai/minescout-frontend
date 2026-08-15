/* oxlint-disable react/only-export-components -- SPA entry, no exports by design */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import { Providers } from './lib/providers'
import { RequireAuth } from './lib/auth'
import { DashboardLayout } from './pages/DashboardLayout'
import { DashboardHome } from './pages/dashboard/DashboardHome'
import { AddServer } from './pages/dashboard/AddServer'
import { EditServer } from './pages/dashboard/EditServer'
import { DashboardRealms } from './pages/dashboard/DashboardRealms'
import { DashboardSettings } from './pages/dashboard/DashboardSettings'
import { ReputationPage } from './pages/dashboard/ReputationPage'
import { ProSubscriptionsPage } from './pages/dashboard/ProSubscriptionsPage'
import { SponsoredSlotsPage } from './pages/dashboard/SponsoredSlotsPage'
import { TransactionsPage } from './pages/dashboard/TransactionsPage'
import { AdminLayout } from './pages/AdminLayout'
import { AdminOverview } from './pages/AdminOverview'
import { AdminServers } from './pages/AdminServers'
import { AdminServerEdit } from './pages/AdminServerEdit'
import { AdminRealms } from './pages/AdminRealms'
import { AdminClaims } from './pages/AdminClaims'
import { AdminReports } from './pages/AdminReports'
import { AdminGamemodes } from './pages/AdminGamemodes'
import { AdminVersions } from './pages/AdminVersions'
import { AdminCountries } from './pages/AdminCountries'
import { AdminBlogEntries } from './pages/AdminBlogEntries'
import { BlogEditor } from './pages/BlogEditor'
import { AdminAiWriter } from './pages/AdminAiWriter'
import { AdminBlogTags } from './pages/AdminBlogTags'
import { AdminUsers } from './pages/AdminUsers'
import { AdminApiKeys } from './pages/AdminApiKeys'
import { AdminPlacements } from './pages/AdminPlacements'
import { AdminBilling } from './pages/AdminBilling'
import { AdminAds } from './pages/AdminAds'
import { AdminLogs } from './pages/AdminLogs'
import { AdminSettings } from './pages/AdminSettings'
import { NotFound } from './pages/NotFound'
import './index.css'

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="dashboard"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="servers" element={<DashboardHome />} />
        <Route path="servers/add" element={<AddServer />} />
        <Route path="servers/:slug" element={<EditServer />} />
        <Route path="servers/:slug/votifier" element={<EditServer votifier />} />
        <Route path="realms" element={<DashboardRealms />} />
        <Route path="reputation" element={<ReputationPage />} />
        <Route path="pro-subscriptions" element={<ProSubscriptionsPage />} />
        <Route path="sponsored-slots" element={<SponsoredSlotsPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="settings" element={<DashboardSettings />} />
        <Route path="*" element={<DashboardHome />} />
      </Route>
      <Route
        path="admin"
        element={
          <RequireAuth adminOnly>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path="servers" element={<AdminServers />} />
        <Route path="servers/new" element={<AdminServerEdit />} />
        <Route path="servers/:slug/edit" element={<AdminServerEdit />} />
        <Route path="realms" element={<AdminRealms />} />
        <Route path="claims" element={<AdminClaims />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="gamemodes" element={<AdminGamemodes />} />
        <Route path="versions" element={<AdminVersions />} />
        <Route path="countries" element={<AdminCountries />} />
        <Route path="blog" element={<AdminBlogEntries />} />
        <Route path="blog/new" element={<BlogEditor />} />
        <Route path="blog/:id/edit" element={<BlogEditor />} />
        <Route path="blog/ai-writer" element={<AdminAiWriter />} />
        <Route path="blog-tags" element={<AdminBlogTags />} />
        <Route path="tags" element={<AdminGamemodes />} />
        <Route path="api-keys" element={<AdminApiKeys />} />
        <Route path="placements" element={<AdminPlacements />} />
        <Route path="billing" element={<AdminBilling />} />
        <Route path="ads" element={<AdminAds />} />
        <Route path="logs" element={<AdminLogs />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Providers>
        <AppRoutes />
      </Providers>
    </BrowserRouter>
  </StrictMode>
)
