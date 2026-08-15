import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Mail, CreditCard, Sparkles, Palette, MessageSquare, Settings2 } from 'lucide-react'
import { api, ApiError } from '../lib/api'
import { useApiQuery } from '../lib/hooks'
import { PageHeader } from '../components/admin/PageHeader'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Switch } from '../components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

function Section({ icon: Icon, title, description, children }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><Icon className="h-4 w-4 text-muted-foreground" /> {title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>
  )
}

interface EnvInfo {
  mailFrom: string
  supportEmail: string
  resendConfigured: boolean
  razorpayConfigured: boolean
  stripeConfigured: boolean
  nimConfigured: boolean
}

export function AdminSettings() {
  const queryClient = useQueryClient()
  const settings = useApiQuery<{ announceChannelId: string | null; guestVotingEnabled: boolean; config: Record<string, unknown> }>(
    ['settings'],
    () => api.get('/settings'),
    { staleTime: 60_000 }
  )
  const env = useApiQuery<EnvInfo>(['settings', 'env'], () => api.get('/settings/admin/env'))

  const [siteName, setSiteName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [announceChannel, setAnnounceChannel] = useState('')
  const [testEmailTo, setTestEmailTo] = useState('')

  const invalidateSettings = () => void queryClient.invalidateQueries({ queryKey: ['settings'] })

  const setConfig = useMutation<{ success: boolean }, ApiError, { key: string; value: unknown }>({
    mutationFn: ({ key, value }) => api.post('/settings/config', { key, value }),
    onSuccess: () => {
      toast.success('Settings saved')
      invalidateSettings()
    },
    onError: (err) => toast.error(err.message),
  })

  const guestVoting = useMutation<{ success: boolean }, ApiError, boolean>({
    mutationFn: (enabled) => api.post('/settings/guest-voting', { enabled }),
    onSuccess: () => {
      toast.success('Updated')
      invalidateSettings()
    },
    onError: (err) => toast.error(err.message),
  })

  const setChannel = useMutation<{ success: boolean }, ApiError, string>({
    mutationFn: (channelId) => api.post('/settings/announce-channel', { channelId }),
    onSuccess: () => {
      toast.success('Announce channel saved')
      invalidateSettings()
    },
    onError: (err) => toast.error(err.message),
  })

  const testEmail = useMutation<{ success: boolean }, ApiError, string>({
    mutationFn: (to) => api.post('/settings/admin/test-email', { to }),
    onSuccess: (data) => {
      if (data.success) toast.success('Test email sent')
      else toast.error('Email not configured (no RESEND_API_KEY).')
    },
    onError: (err) => toast.error(err.message),
  })

  const config = settings.data?.config ?? {}

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <PageHeader title="Settings" description="Branding, email, gateways and platform toggles." />

      <Section icon={Palette} title="Branding" description="Site name and logo shown in the header and meta tags.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Site name</span>
            <Input
              defaultValue={String(config.siteName ?? 'Minescout')}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="Minescout"
            />
            <Button size="sm" variant="outline" className="w-fit" onClick={() => setConfig.mutate({ key: 'siteName', value: siteName || 'Minescout' })}>
              Save name
            </Button>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Logo URL</span>
            <Input
              defaultValue={String(config.logoUrl ?? '')}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://…/logo.png"
            />
            <Button size="sm" variant="outline" className="w-fit" onClick={() => setConfig.mutate({ key: 'logoUrl', value: logoUrl })}>
              Save logo
            </Button>
          </div>
        </div>
      </Section>

      <Section icon={Settings2} title="Platform" description="Voting behaviour and Discord announcements.">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Guest voting</span>
            <span className="text-sm text-muted-foreground">Allow signed-out visitors to vote.</span>
          </div>
          <Switch
            checked={settings.data?.guestVotingEnabled ?? false}
            disabled={settings.isLoading || guestVoting.isPending}
            onCheckedChange={(v) => guestVoting.mutate(v)}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Announce channel</span>
            <span className="text-sm text-muted-foreground">Discord channel id for bot announcements.</span>
          </div>
          <Input
            className="ml-auto max-w-[220px]"
            defaultValue={settings.data?.announceChannelId ?? ''}
            onChange={(e) => setAnnounceChannel(e.target.value)}
            placeholder="Channel id"
          />
          <Button size="sm" variant="outline" onClick={() => announceChannel && setChannel.mutate(announceChannel)}>Save</Button>
        </div>
      </Section>

      <Section icon={Mail} title="Email" description="Sender details and delivery test.">
        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <div className="rounded-md border bg-muted/40 p-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">From</span>
            <p className="mt-1 break-all font-mono text-xs">{env.data?.mailFrom ?? '…'}</p>
          </div>
          <div className="rounded-md border bg-muted/40 p-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Support</span>
            <p className="mt-1 break-all font-mono text-xs">{env.data?.supportEmail ?? '…'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Input
            className="max-w-xs"
            value={testEmailTo}
            onChange={(e) => setTestEmailTo(e.target.value)}
            placeholder="you@example.com"
            type="email"
          />
          <Button size="sm" variant="outline" disabled={!testEmailTo} onClick={() => testEmail.mutate(testEmailTo)}>
            {testEmail.isPending ? 'Sending…' : 'Send test email'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Resend {env.data?.resendConfigured ? 'configured' : 'not configured'}</p>
      </Section>

      <Section icon={CreditCard} title="Payments" description="Gateway status (keys live in backend env only).">
        <div className="flex flex-wrap gap-3 text-sm">
          <StatusPill ok={env.data?.resendConfigured} label="Resend email" />
          <StatusPill ok={env.data?.razorpayConfigured} label="Razorpay" />
          <StatusPill ok={env.data?.stripeConfigured} label="Stripe" />
          <StatusPill ok={env.data?.nimConfigured} label="AI writer" />
        </div>
      </Section>

      <Section icon={Sparkles} title="AI writer" description="AI blog writer availability.">
        <p className="text-sm text-muted-foreground">
          {env.data?.nimConfigured ? 'AI writer is ready.' : 'AI writer is not configured — set NIM_API_KEY in backend env.'}
        </p>
      </Section>

      <Section icon={MessageSquare} title="Cache" description="Bust cached public responses.">
        <Button size="sm" variant="outline" onClick={() => setConfig.mutate({ key: 'cacheBump', value: Date.now() })} disabled={setConfig.isPending}>
          Bump cache revision
        </Button>
      </Section>
    </div>
  )
}

function StatusPill({ ok, label }: { ok?: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${ok ? 'border-transparent bg-green-500/15 text-green-700 dark:text-green-400' : 'border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${ok ? 'bg-green-500' : 'bg-amber-500'}`} />
      {label}: {ok ? 'ready' : 'missing'}
    </span>
  )
}
