import { Routes, Route, Navigate, useParams } from 'react-router'
import { RootLayout } from './layouts/RootLayout'
import { RequireAuth } from './lib/auth'
import { Home } from './pages/Home'
import { ServerList } from './pages/ServerList'
import { GameModes, Versions, Countries, Tags } from './pages/Facets'
import { SearchPage } from './pages/SearchPage'
import { ContentPage } from './pages/ContentPage'
import { ToolsPage } from './pages/ToolsPage'
import { MotdGenerator } from './pages/MotdGenerator'
import { BlogIndex, BlogPost } from './pages/Blog'
import { StatsPage } from './pages/StatsPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
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
import { AdminAds } from './pages/AdminAds'
import { AdminUsers } from './pages/AdminUsers'
import { AdminApiKeys } from './pages/AdminApiKeys'
import { AdminPlacements } from './pages/AdminPlacements'
import { AdminBilling } from './pages/AdminBilling'
import { RealmPage } from './pages/RealmPage'
import { ServerLayout } from './pages/ServerLayout'
import { ServerOverview } from './pages/ServerOverview'
import { ServerVote } from './pages/ServerVote'
import { ServerReviews } from './pages/ServerReviews'
import { ServerStats } from './pages/ServerStats'
import { AdminOverview } from './pages/AdminOverview'
import { AdminServers } from './pages/AdminServers'
import { AdminModeration } from './pages/AdminModeration'
import { AdminContent } from './pages/AdminContent'
import { BlogEditor } from './pages/BlogEditor'
import { AdminTags } from './pages/AdminTags'
import { AdminChest } from './pages/AdminChest'
import { NotFound } from './pages/NotFound'

const MIGRATED_PAGE_SLUGS = new Set([
  'how-to-get-more-players-on-a-minecraft-server',
  'how-to-join-a-minecraft-server',
  'how-to-make-a-minecraft-server',
  'how-to-make-a-modded-minecraft-server',
  'how-to-make-a-blast-furnace-in-minecraft',
  'how-to-make-an-armor-stand-in-minecraft',
  'how-to-tame-a-fox-in-minecraft',
  'best-minecraft-servers-2026',
  'minelist-the-best-minecraft-server-list-script',
])

function RedirectingContent() {
  const { slug } = useParams()
  if (slug && MIGRATED_PAGE_SLUGS.has(slug)) return <Navigate to={`/blog/${slug}`} replace />
  return <ContentPage />
}

function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="java-servers" element={<ServerList />} />
        <Route path="bedrock-servers" element={<ServerList />} />
        <Route path="crossplay-servers" element={<ServerList />} />
        <Route path="new-minecraft-servers" element={<ServerList />} />
        <Route path="popular" element={<ServerList />} />
        <Route path="whitelist" element={<ServerList />} />
        <Route path="gamemodes" element={<GameModes />} />
        <Route path="gamemodes/:slug" element={<ServerList />} />
        <Route path="versions" element={<Versions />} />
        <Route path="versions/:slug" element={<ServerList />} />
        <Route path="countries" element={<Countries />} />
        <Route path="countries/:slug" element={<ServerList />} />
        <Route path="tags" element={<Tags />} />
        <Route path="tag/:slug" element={<ServerList />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="pages/:slug" element={<RedirectingContent />} />
        <Route path="pages/server-status-checker" element={<ToolsPage tool="status" />} />
        <Route path="pages/votifier-tester" element={<ToolsPage tool="votifier" />} />
        <Route path="pages/motd-generator" element={<MotdGenerator />} />
        <Route path="featured-slots" element={<ContentPage slug="featured-slots" />} />
        <Route path="sponsored-slots" element={<ContentPage slug="sponsored-slots" />} />
        <Route path="pro-pricing" element={<ContentPage slug="pro-pricing" />} />
        <Route path="realms" element={<ContentPage slug="realms" />} />
        <Route path="how-to-get-more-players-on-a-minecraft-server" element={<Navigate to="/blog/how-to-get-more-players-on-a-minecraft-server" replace />} />
        <Route path="blog" element={<BlogIndex />} />
        <Route path="blog/:slug" element={<BlogPost />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
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
          <Route path="moderation" element={<AdminModeration />} />
          <Route path="ads" element={<AdminAds />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="content/blog/new" element={<BlogEditor />} />
          <Route path="content/blog/:id/edit" element={<BlogEditor />} />
          <Route path="tags" element={<AdminTags />} />
          <Route path="chest" element={<AdminChest />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="api-keys" element={<AdminApiKeys />} />
          <Route path="placements" element={<AdminPlacements />} />
          <Route path="billing" element={<AdminBilling />} />
        </Route>
        <Route path=":slug" element={<ServerLayout />}>
          <Route index element={<ServerOverview />} />
          <Route path="vote" element={<ServerVote />} />
          <Route path="reviews" element={<ServerReviews />} />
          <Route path="stats" element={<ServerStats />} />
        </Route>
        <Route path="realm/:code" element={<RealmPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
