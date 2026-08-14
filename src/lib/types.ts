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
