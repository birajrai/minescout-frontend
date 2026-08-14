const COLOR_CODES: Record<string, string> = {
  '0': '#000000', '1': '#0000AA', '2': '#00AA00', '3': '#00AAAA',
  '4': '#AA0000', '5': '#AA00AA', '6': '#FFAA00', '7': '#AAAAAA',
  '8': '#555555', '9': '#5555FF', a: '#55FF55', b: '#55FFFF',
  c: '#FF5555', d: '#FF55FF', e: '#FFFF55', f: '#FFFFFF',
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

interface MotdState {
  color: string | null
  bold: boolean
  italic: boolean
  underline: boolean
  strikethrough: boolean
}

function styleOf(s: MotdState): string {
  const parts: string[] = []
  if (s.color) parts.push(`color:${s.color}`)
  if (s.bold) parts.push('font-weight:bold')
  if (s.italic) parts.push('font-style:italic')
  if (s.underline) parts.push('text-decoration:underline')
  if (s.strikethrough) parts.push('text-decoration:line-through')
  return parts.join(';')
}

function pushSegment(buf: string[], text: string, s: MotdState): void {
  if (!text) return
  const style = styleOf(s)
  buf.push(style ? `<span style="${style}">${escapeHtml(text)}</span>` : escapeHtml(text))
}

/** Convert a raw MOTD string (with § codes and \n) to inline HTML spans. */
export function motdToHtml(motd: string): string {
  if (!motd) return ''
  const out: string[] = []
  const state: MotdState = { color: null, bold: false, italic: false, underline: false, strikethrough: false }
  let buf = ''
  const flush = () => {
    pushSegment(out, buf, state)
    buf = ''
  }
  let i = 0
  while (i < motd.length) {
    const ch = motd[i]
    if (ch === '\u00A7') {
      const code = motd[i + 1]
      if (code === undefined) {
        buf += ch
        i++
        continue
      }
      flush()
      const c = code.toLowerCase()
      if (c in COLOR_CODES) {
        state.color = COLOR_CODES[c]
      } else if (c === 'l') state.bold = true
      else if (c === 'o') state.italic = true
      else if (c === 'n') state.underline = true
      else if (c === 'm') state.strikethrough = true
      else if (c === 'r') {
        state.color = null
        state.bold = state.italic = state.underline = state.strikethrough = false
      }
      i += 2
      continue
    }
    if (ch === '\n') {
      flush()
      out.push('<br>')
      i++
      continue
    }
    buf += ch
    i++
  }
  flush()
  return out.join('')
}
