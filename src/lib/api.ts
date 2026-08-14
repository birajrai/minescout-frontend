export interface ApiErrorBody {
  statusCode?: number
  message?: string | string[]
  error?: string
}

export class ApiError extends Error {
  status: number
  body: ApiErrorBody

  constructor(status: number, body: ApiErrorBody) {
    super(typeof body.message === 'string' ? body.message : (body.error ?? `Request failed (${status})`))
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export function errorMessage(error: ApiError): string {
  if (Array.isArray(error.body.message)) return error.body.message.join('. ')
  return error.message
}

export const API_BASE = '/api'

type QueryValue = string | number | boolean | undefined | null

export function buildQuery(params: Record<string, QueryValue>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    if (res.status === 204) return undefined as T
    return (await res.json()) as T
  }
  let body: ApiErrorBody = {}
  try {
    body = (await res.json()) as ApiErrorBody
  } catch {
    // non-JSON error body
  }
  throw new ApiError(res.status, body)
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers:
      init.body !== undefined
        ? { 'Content-Type': 'application/json', ...(init.headers ?? {}) }
        : init.headers,
    ...init,
  })
  return parseResponse<T>(res)
}

export const api = {
  get: <T>(path: string, params?: Record<string, QueryValue>) =>
    request<T>(`${path}${params ? buildQuery(params) : ''}`),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body === undefined ? undefined : JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
