import type { NotificationRecord } from "@/types/notifications"

const API_URL = import.meta.env.VITE_API_URL

async function request<T>(endpoint: string, accessToken: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })

  if (!response.ok) {
    let message = "Notification request failed."
    try {
      const body = await response.json() as { message?: string }
      if (body.message) message = body.message
    } catch {
      // Use the readable default when the server sends no JSON error body.
    }
    throw new Error(message)
  }

  return response.json() as Promise<T>
}

export function getUserNotifications(userId: number, accessToken: string) {
  return request<NotificationRecord[]>(`/api/notifications/user/${userId}`, accessToken)
}

export function markNotificationRead(notificationId: number, accessToken: string) {
  return request<NotificationRecord>(`/api/notifications/${notificationId}/read`, accessToken, { method: "PATCH" })
}
