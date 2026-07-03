import type { ApiError } from '@/types/catalog'

export class HttpError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

function parseErrorMessage(payload: ApiError | string): string {
  if (typeof payload === 'string') {
    return payload
  }

  if (Array.isArray(payload.message)) {
    return payload.message.join(', ')
  }

  return payload.message
}

export async function api<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (response.status === 204) {
    return undefined as T
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const message = payload
      ? parseErrorMessage(payload as ApiError)
      : 'Erro ao comunicar com a API.'

    throw new HttpError(message, response.status)
  }

  return payload as T
}
