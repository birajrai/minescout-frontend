import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api, errorMessage, ApiError } from '../lib/api'
import { PageHero } from '../components/Shared'
import type { StatusCheckResult, VotifierTestResult } from '../lib/types'

const inputCls =
  'h-10 px-3 rounded-sm border-2 border-stone-400 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-stone-600 dark:text-stone-400">{label}</label>
      {children}
    </div>
  )
}

function StatusChecker() {
  const [host, setHost] = useState('')
  const [port, setPort] = useState('25565')
  const [edition, setEdition] = useState('java')
  const check = useMutation<StatusCheckResult, ApiError>({
    mutationFn: async () =>
      api.post<StatusCheckResult>('/tools/status-check', {
        host: host.trim(),
        port: port ? Number(port) : undefined,
        edition,
      }),
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!host.trim()) return
    check.mutate()
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Server address">
          <input required value={host} onChange={(e) => setHost(e.target.value)} placeholder="play.example.com" className={inputCls} />
        </Field>
        <Field label="Port">
          <input type="number" min={1} max={65535} value={port} onChange={(e) => setPort(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Edition">
          <select value={edition} onChange={(e) => setEdition(e.target.value)} className={inputCls}>
            <option value="java">Java</option>
            <option value="bedrock">Bedrock</option>
          </select>
        </Field>
        <div className="md:col-span-3">
          <button type="submit" disabled={check.isPending} className="btn-accent btn-wrapper relative before:border rounded-md before:rounded-md h-11 before:h-11 inline-flex">
            <span className="btn-surface rounded-md font-bold border select-none w-full h-full px-6 inline-flex items-center justify-center text-sm text-stone-900">
              {check.isPending ? 'Checking…' : 'Check server'}
            </span>
          </button>
        </div>
      </form>
      {check.isError && <p className="rounded-sm border border-red-600/40 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">{errorMessage(check.error)}</p>}
      {check.isSuccess && check.data && (
        <div className="rounded-sm border border-stone-300 dark:border-stone-600 bg-stone-100/50 dark:bg-stone-800/50 overflow-hidden">
          <table className="w-full text-sm caption-bottom">
            <tbody className="[&_tr:last-child]:border-0">
              {[
                ['Status', check.data.online ? 'Online' : 'Offline'],
                ['Version', check.data.version ?? '—'],
                ['Players', check.data.players !== undefined ? `${check.data.players}/${check.data.maxPlayers ?? '?'}` : '—'],
                ['MOTD', check.data.motd ?? '—'],
                ['Latency', check.data.latencyMs !== undefined ? `${check.data.latencyMs} ms` : '—'],
              ].map(([k, v]) => (
                <tr key={k} className="border-b border-stone-200 dark:border-stone-700">
                  <td className="p-3 font-bold whitespace-nowrap align-middle">{k}</td>
                  <td className="p-3 align-middle break-words">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function VotifierTester() {
  const [host, setHost] = useState('')
  const [port, setPort] = useState('8192')
  const [protocol, setProtocol] = useState('auto')
  const [token, setToken] = useState('')
  const [pubKey, setPubKey] = useState('')
  const test = useMutation<VotifierTestResult, ApiError>({
    mutationFn: async () =>
      api.post<VotifierTestResult>('/tools/votifier-test', {
        host: host.trim(),
        port: port ? Number(port) : undefined,
        protocol,
        token: token.trim() || undefined,
        pubKey: pubKey.trim() || undefined,
      }),
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!host.trim()) return
    test.mutate()
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Votifier host">
          <input required value={host} onChange={(e) => setHost(e.target.value)} placeholder="play.example.com" className={inputCls} />
        </Field>
        <Field label="Port">
          <input type="number" min={1} max={65535} value={port} onChange={(e) => setPort(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Protocol">
          <select value={protocol} onChange={(e) => setProtocol(e.target.value)} className={inputCls}>
            <option value="auto">Auto (v2 then v1)</option>
            <option value="v1">v1</option>
            <option value="v2">v2</option>
          </select>
        </Field>
        <Field label="Token (v2)">
          <input value={token} onChange={(e) => setToken(e.target.value)} className={inputCls} />
        </Field>
        <div className="md:col-span-2">
          <Field label="RSA public key (v1)">
            <textarea value={pubKey} onChange={(e) => setPubKey(e.target.value)} rows={4} className="px-3 py-2 rounded-sm border-2 border-stone-400 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 text-sm resize-y" />
          </Field>
        </div>
        <div className="md:col-span-2">
          <button type="submit" disabled={test.isPending} className="btn-accent btn-wrapper relative before:border rounded-md before:rounded-md h-11 before:h-11 inline-flex">
            <span className="btn-surface rounded-md font-bold border select-none w-full h-full px-6 inline-flex items-center justify-center text-sm text-stone-900">
              {test.isPending ? 'Testing…' : 'Test Votifier'}
            </span>
          </button>
        </div>
      </form>
      {test.isError && <p className="rounded-sm border border-red-600/40 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">{errorMessage(test.error)}</p>}
      {test.isSuccess && test.data && (
        <div className={`rounded-sm border px-3 py-2 text-sm ${test.data.ok ? 'border-lime-600/40 bg-lime-500/10 text-lime-700 dark:text-lime-400' : 'border-red-600/40 bg-red-500/10 text-red-700 dark:text-red-400'}`}>
          <p className="font-bold">{test.data.ok ? 'Success' : 'Failed'}{test.data.protocol ? ` (${test.data.protocol})` : ''}</p>
          {test.data.message && <p className="mt-1">{test.data.message}</p>}
        </div>
      )}
    </div>
  )
}

export function ToolsPage({ tool }: { tool: 'status' | 'votifier' }) {
  const title = tool === 'status' ? 'Minecraft Server Status Checker' : 'Minecraft Votifier Tester'
  return (
    <>
      <PageHero crumbs={[{ to: '/', label: 'Home' }, { label: title }]} title={title} />
      <div className="wrapper flex flex-col gap-6 max-w-3xl px-4 py-6">
        <div className="rounded-sm border border-stone-400 dark:border-stone-600 bg-stone-200/50 dark:bg-stone-800/50 p-6 md:p-8">
          {tool === 'status' ? <StatusChecker /> : <VotifierTester />}
        </div>
      </div>
    </>
  )
}
