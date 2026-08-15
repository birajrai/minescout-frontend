import { useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { UploadCloud } from 'lucide-react'
import { api, errorMessage, ApiError } from '../lib/api'

export interface UploadedImage {
  url: string
  publicUrl: string
  local?: boolean
}

export function ImageField({ label, value, onChange, kind, hint }: {
  label: string
  value: string
  onChange: (url: string) => void
  kind: 'icon' | 'banner' | 'cover'
  hint?: string
}) {
  const [status, setStatus] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const up = useMutation<UploadedImage, ApiError, { kind: string; filename: string; dataUrl: string }>({
    mutationFn: ({ kind, filename, dataUrl }) => api.post<UploadedImage>('/upload', { kind, filename, dataUrl }),
    onSuccess: (d) => {
      onChange(d.publicUrl)
      setStatus(hint ? 'Uploaded — link filled in below.' : 'Uploaded — converted to AVIF.')
      if (inputRef.current) inputRef.current.value = ''
    },
    onError: (e) => setStatus(errorMessage(e)),
  })

  const pick = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : ''
      if (!dataUrl) return
      up.mutate({ kind, filename: file.name, dataUrl })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-stone-600 dark:text-stone-400">{label}</label>
      <div className="flex flex-col gap-2">
        {value ? (
          <div className="relative w-full h-28 rounded-sm border border-stone-400 dark:border-stone-600 overflow-hidden bg-stone-200 dark:bg-stone-800">
            <img src={value} alt={label} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none' }} />
          </div>
        ) : (
          <div className="w-full h-16 rounded-sm border border-dashed border-stone-400 dark:border-stone-600 bg-stone-200/40 dark:bg-stone-800/40 flex items-center justify-center text-xs text-stone-500 dark:text-stone-400">
            No image set
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            disabled={up.isPending}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 h-9 px-3 rounded-sm border-2 border-stone-400 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 text-xs font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 disabled:opacity-60 transition-colors"
          >
            <UploadCloud className="size-4" />
            {up.isPending ? 'Uploading…' : `Upload ${kind}`}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/avif,image/svg+xml,image/tiff,image/bmp,image/heic,image/heif"
            className="hidden"
            onChange={(e) => pick(e.target.files?.[0])}
          />
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://…"
            className="flex-1 h-9 px-3 rounded-sm border-2 border-stone-400 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        {status && <span className={`text-xs ${up.isError ? 'text-red-600 dark:text-red-400' : 'text-lime-600 dark:text-lime-400'}`}>{status}</span>}
        {hint && <span className="text-xs text-stone-500 dark:text-stone-400">{hint}</span>}
      </div>
    </div>
  )
}
