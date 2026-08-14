import { useMemo, useRef, useState } from 'react'
import { Copy, Check, RotateCcw } from 'lucide-react'
import { PageHero } from '../components/Shared'
import { motdToHtml } from '../lib/motd'

const COLORS: { code: string; name: string; hex: string }[] = [
  { code: '0', name: 'Black', hex: '#000000' },
  { code: '1', name: 'Dark Blue', hex: '#0000AA' },
  { code: '2', name: 'Dark Green', hex: '#00AA00' },
  { code: '3', name: 'Dark Aqua', hex: '#00AAAA' },
  { code: '4', name: 'Dark Red', hex: '#AA0000' },
  { code: '5', name: 'Dark Purple', hex: '#AA00AA' },
  { code: '6', name: 'Gold', hex: '#FFAA00' },
  { code: '7', name: 'Gray', hex: '#AAAAAA' },
  { code: '8', name: 'Dark Gray', hex: '#555555' },
  { code: '9', name: 'Blue', hex: '#5555FF' },
  { code: 'a', name: 'Green', hex: '#55FF55' },
  { code: 'b', name: 'Aqua', hex: '#55FFFF' },
  { code: 'c', name: 'Red', hex: '#FF5555' },
  { code: 'd', name: 'Light Purple', hex: '#FF55FF' },
  { code: 'e', name: 'Yellow', hex: '#FFFF55' },
  { code: 'f', name: 'White', hex: '#FFFFFF' },
]

const FORMATS = [
  { code: 'l', name: 'Bold', style: 'font-weight:bold' },
  { code: 'o', name: 'Italic', style: 'font-style:italic' },
  { code: 'n', name: 'Underline', style: 'text-decoration:underline' },
  { code: 'm', name: 'Strikethrough', style: 'text-decoration:line-through' },
  { code: 'r', name: 'Reset', style: '' },
]

const PRESETS: { name: string; text: string }[] = [
  { name: 'Classic', text: '§6Welcome to §cOur§6 Server\n§e1.21 Survival §7· §afresh map' },
  { name: 'Survival', text: '§aSurvival §8» §fSeason 3\n§7online §e123 §7players' },
  { name: 'Skyblock', text: '§bSkyblock §8» §fJoin the island\n§7SkyBlock §8• §6Economy §8• §eEvents' },
  { name: 'Minigames', text: '§dMinigames §8» §fBedwars, Skywars\n§7click §ePLAY §7to join the queue' },
]

function stripCodes(s: string): string {
  return s.replace(/\u00A7./g, '').replace(/\n/g, '\n')
}

export function MotdGenerator() {
  const [text, setText] = useState(PRESETS[0]!.text)
  const [copied, setCopied] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const html = useMemo(() => motdToHtml(text), [text])

  const insert = (code: string) => {
    const el = textareaRef.current
    if (!el) return
    const token = `\u00A7${code}`
    const start = el.selectionStart
    const end = el.selectionEnd
    const next = text.slice(0, start) + token + text.slice(end)
    setText(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + token.length, start + token.length)
    })
  }

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(label)
      setTimeout(() => setCopied((c) => (c === label ? null : c)), 1500)
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <>
      <PageHero
        crumbs={[{ to: '/', label: 'Home' }, { label: 'Minecraft MOTD Generator' }]}
        title="Minecraft MOTD Generator"
        subtext="Create colored server MOTD lines with a live preview"
      />
      <div className="wrapper flex flex-col gap-6 max-w-3xl px-4 py-6">
        <div className="rounded-sm border border-stone-400 dark:border-stone-600 bg-stone-200/50 dark:bg-stone-800/50 p-6 md:p-8 flex flex-col gap-4">
          {/* Palette */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-stone-600 dark:text-stone-400">Colors</span>
            <div className="flex flex-wrap gap-1.5">
              {COLORS.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  title={c.name}
                  aria-label={`Insert §${c.code} (${c.name})`}
                  onClick={() => insert(c.code)}
                  className="size-8 rounded-sm border border-stone-500/60 hover:scale-110 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-stone-600 dark:text-stone-400">Format</span>
            <div className="flex flex-wrap gap-1.5">
              {FORMATS.map((f) => (
                <button
                  key={f.code}
                  type="button"
                  title={f.name}
                  onClick={() => insert(f.code)}
                  className="h-8 px-3 rounded-sm border border-stone-400 dark:border-stone-600 bg-stone-100 dark:bg-stone-900 text-sm font-medium hover:bg-stone-300 dark:hover:bg-stone-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span style={f.style ? { [f.style.split(':')[0] as string]: f.style.split(':')[1] } : undefined}>{f.name}</span>
                </button>
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-1 text-xs font-medium text-stone-600 dark:text-stone-400">
            MOTD text <span className="text-stone-500">(§ codes, one line per row)</span>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              spellCheck={false}
              className="px-3 py-2 rounded-sm border-2 border-stone-400 dark:border-stone-600 bg-stone-100 dark:bg-stone-900 text-sm font-mono text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary resize-y"
            />
          </label>

          {/* Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-stone-600 dark:text-stone-400 mr-1">Presets:</span>
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => setText(p.text)}
                className="h-8 px-3 rounded-sm border border-stone-400 dark:border-stone-600 bg-stone-100 dark:bg-stone-900 text-xs font-medium hover:bg-stone-300 dark:hover:bg-stone-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {p.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setText('')}
              className="inline-flex items-center gap-1 h-8 px-3 rounded-sm border border-stone-400 dark:border-stone-600 bg-stone-100 dark:bg-stone-900 text-xs font-medium hover:bg-stone-300 dark:hover:bg-stone-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <RotateCcw className="size-3" /> Clear
            </button>
          </div>

          {/* Live preview */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-stone-600 dark:text-stone-400">Live preview</span>
            <div className="rounded-sm border border-stone-600 bg-[#0d0d0d] px-4 py-3 min-h-[72px] flex items-center">
              <div
                className="text-base leading-relaxed break-words"
                dangerouslySetInnerHTML={{ __html: html || '<span class="text-stone-600">&nbsp;</span>' }}
              />
            </div>
          </div>

          {/* Copy actions */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void copy('raw', text)}
              className="btn-accent btn-wrapper relative before:border rounded-md before:rounded-md h-11 before:h-11 inline-flex"
            >
              <span className="btn-surface rounded-md font-bold border select-none w-full h-full px-5 inline-flex items-center justify-center gap-2 text-sm text-stone-900">
                {copied === 'raw' ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied === 'raw' ? 'Copied!' : 'Copy with § codes'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => void copy('plain', stripCodes(text))}
              className="btn-accent btn-wrapper relative before:border rounded-md before:rounded-md h-11 before:h-11 inline-flex"
            >
              <span className="btn-surface rounded-md font-bold border select-none w-full h-full px-5 inline-flex items-center justify-center gap-2 text-sm text-stone-900">
                {copied === 'plain' ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied === 'plain' ? 'Copied!' : 'Copy plain text'}
              </span>
            </button>
          </div>

          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            In <span className="font-mono">server.properties</span>, set <span className="font-mono">motd</span> to the raw text with § codes. For spigot
            configs, use <span className="font-mono">motd-1</span> / <span className="font-mono">motd-2</span>. Newlines split the two lines shown above the server status in the server list.
          </p>
        </div>
      </div>
    </>
  )
}
