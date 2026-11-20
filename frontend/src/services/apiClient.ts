const API_URL = import.meta.env.VITE_API_URL ?? ""

/** Sends an authenticated request and unwraps both API envelope and plain responses. */
export async function apiRequest<T>(endpoint: string, accessToken: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set("Authorization", `Bearer ${accessToken}`)
  if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json")

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers })
  if (response.status === 204) return undefined as T

  const payload = await response.json().catch(() => null) as { success?: boolean; message?: string; data?: T } | T | null
  if (!response.ok) {
    const message = payload && typeof payload === "object" && "message" in payload ? payload.message : undefined
    throw new Error(typeof message === "string" ? message : `Request failed (${response.status})`)
  }
  if (payload && typeof payload === "object" && "success" in payload) {
    const envelope = payload as { success?: boolean; message?: string; data?: T }
    if (!envelope.success) throw new Error(envelope.message || "The request could not be completed")
    return envelope.data as T
  }
  return payload as T
}

export const jsonBody = (body: unknown): Pick<RequestInit, "method" | "body"> => ({ method: "POST", body: JSON.stringify(body) })
