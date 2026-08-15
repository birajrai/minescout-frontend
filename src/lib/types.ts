export interface Server {
  id: string
  name: string
  slug: string
  ip: string
  port: number
  description: string
  website: string
  discord: string
  bannerUrl: string
  coverUrl: string
  videoUrl: string
  version: string
  supportedVersions: string[]
  tags: string[]
  edition: 'java' | 'bedrock' | 'crossplay'
  country: string
  bedrockIp: string
  bedrockPort: number
  whitelist: boolean
  featured: boolean
  verified: boolean
  votifierEnabled: boolean
  votifierHost: string
  votifierPort: number
  votifierProtocol: 'v1' | 'v2' | 'auto'
  votifierServiceName: string
  totalVotes: number
  weeklyVotes: number
  peakPlayers: number
  peakPlayersDate: string | null
  online: boolean
  playersOnline: number
  playersMax: number
  motd: string
  icon: string
  lastChecked: string | null
  latencyMs: number
  uptimePct: number
  rating: number
  reviewCount: number
  proGrantedUntil: string | null
  createdAt: string
  updatedAt: string
  rank?: number
}

export interface Paged<T> {
  results: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type ServerSort = 'weekly' | 'total' | 'peak' | 'online' | 'newest' | 'rating'

export interface ServerListParams {
  search?: string
  tag?: string
  gamemode?: string
  edition?: string
  version?: string
  country?: string
  whitelist?: boolean
  sort?: ServerSort
  page?: number
  limit?: number
}

export interface HistoryPoint {
  timestamp: string
  online: number
  max: number
}

export interface RankPoint {
  rank: number
  votes: number
  players: number
  uptimePct: number
  timestamp: string
}

export interface Review {
  id: string
  rating: number
  title: string
  body: string
  createdAt: string
  updatedAt: string
  author: string
  authorAvatar: string | null
}

export interface VoteCheck {
  canVote: boolean
  nextVoteAt?: string
  reason?: string
}

export interface VoteResult {
  success: boolean
  name: string
  slug: string
  totalVotes: number
  weeklyVotes: number
}

export interface RecentVote {
  username: string
  source: 'web' | 'discord'
  votedAt: string
}

export interface Facet {
  slug: string
  name?: string
  label?: string
  code?: string
  serverCount: number
}

export interface GlobalStats {
  servers: number
  serversOnline: number
  playersOnline: number
  votesAllTime: number
  weeklyVotes: number
  votesToday: number
  topGamemodes: { gamemode: string; servers: number; votes: number }[]
  topServers: { name: string; slug: string; weeklyVotes: number; playersOnline: number }[]
}

export interface AuthUser {
  id: string
  userId: string
  username: string
  avatar?: string | null
  email?: string | null
  isAdmin: boolean
}

export interface AuthMe {
  user: AuthUser
  isAdmin: boolean
}

export interface MeUser {
  id: string
  username: string
  avatar?: string | null
  email?: string | null
  banned?: boolean
  createdAt?: string
}

export interface SavedServer {
  serverId: string
  slug: string
  name: string
  ip: string
  icon: string
  savedAt: string
}

export interface CmsPage {
  slug: string
  title: string
  contentMarkdown: string
  seoTitle: string
  seoDescription: string
  updatedAt: string
}

export interface BlogListResult {
  id: string
  slug: string
  title: string
  excerpt?: string | null
  coverUrl?: string | null
  publishedAt: string | null
  author: string
  authorAvatar?: string | null
}

export interface BlogPost extends BlogListResult {
  bodyMarkdown: string
}

export interface Realm {
  id: string
  code: string
  name: string
  description?: string
  edition?: string
  region?: string
}

export interface StatusCheckResult {
  online: boolean
  version?: string
  players?: number
  maxPlayers?: number
  motd?: string
  latencyMs?: number
}

export interface VotifierTestResult {
  ok: boolean
  protocol?: string
  message?: string
}

// ---- Billing / subscriptions / transactions ----

export type PlanId = 'free' | 'pro'
export type GatewayId = 'contact' | 'razorpay' | 'stripe'

export interface BillingPlan {
  id: PlanId
  name: string
  price: number
  currency: string
  periodDays: number | null
  features: string[]
}

export type SubscriptionStatus = 'free' | 'active' | 'pending' | 'past_due' | 'cancelled' | 'expired'

export interface MySubscription {
  id: string
  plan: PlanId
  status: SubscriptionStatus
  gateway: GatewayId
  serverId: string | null
  periodStart: string | null
  periodEnd: string | null
  createdAt: string
  isActive: boolean
}

export interface ProServer {
  id: string
  name: string
  slug: string
  icon: string
  featured: boolean
  proGrantedUntil: string | null
}

export type TransactionStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled'
export type TransactionKind = 'subscription' | 'sponsored_slot' | 'adjustment'

export interface BillingTransaction {
  id: string
  kind: TransactionKind
  plan: PlanId
  description: string
  gateway: GatewayId
  gatewayRef: string
  amount: number
  currency: string
  status: TransactionStatus
  createdAt: string
  updatedAt: string
}

export interface BillingSummary {
  plans: BillingPlan[]
  subscription: MySubscription | null
  proServers: ProServer[]
  transactions: BillingTransaction[]
}

export interface GatewayOrder {
  gateway: GatewayId
  status: 'pending' | 'paid'
  orderId?: string
  keyId?: string
  url?: string
  amount?: number
  currency?: string
  message?: string
}

export interface CheckoutResult {
  ok: boolean
  plan: PlanId
  subscriptionId?: string
  transactionId?: string
  amount?: number
  currency?: string
  order?: GatewayOrder
  message?: string
}

export interface ReputationServerStat {
  id: string
  name: string
  slug: string
  icon: string
  rating: number
  reviewCount: number
  totalVotes: number
}

export interface ReputationReview {
  id: string
  rating: number
  title: string
  body: string
  createdAt: string
  author: string
  authorAvatar: string | null
  serverName: string
  serverSlug: string
  serverIcon: string
}

export interface ReputationSummary {
  received: { count: number; avgRating: number; votes: number }
  written: { count: number; avgRating: number }
  servers: ReputationServerStat[]
  recent: ReputationReview[]
}

export interface MyPlacement {
  id: string
  type: 'featured' | 'sponsored' | 'pro'
  slot: number
  gamemodes: string[]
  startsAt: string | null
  endsAt: string | null
  active: boolean
  createdAt: string
  serverName: string
  serverSlug: string
  serverIcon: string
}

export interface AdminBillingTransaction extends BillingTransaction {
  username: string
  serverName: string | null
  serverSlug: string | null
}

export interface AdminPlacement {
  id: string
  type: 'featured' | 'sponsored' | 'pro'
  slot: number
  gamemodes: string[]
  startsAt: string | null
  endsAt: string | null
  active: boolean
  createdAt: string
  serverId: string
  serverName: string
  serverSlug: string
  serverIcon: string
}

export interface AdminUser {
  id: string
  discordId: string | null
  googleId: string | null
  username: string
  avatar: string | null
  email: string | null
  roles: string[]
  banned: boolean
  minecraftUsername: string
  bio: string
  createdAt: string
  lastLoginAt: string
}

export interface ApiKey {
  id: string
  name: string
  scopes: string[]
  revoked: boolean
  lastUsedAt: string | null
  createdAt: string
}
