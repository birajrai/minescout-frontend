import type { Config } from '@react-router/dev/config'

export default {
  // Public pages are server-rendered for SEO. Admin + user dashboard are a
  // client-only SPA (app.html entry) and never touch the server renderer.
  ssr: true,
  appDirectory: 'src',
} satisfies Config
