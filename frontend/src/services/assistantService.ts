import type { ApiResponse } from "@/types/auth"

export interface VoiceIntentResponse {
  intent: "NAVIGATE" | "FILTER_TASKS" | "UNSUPPORTED" | "CLARIFICATION_REQUIRED"
  destination: "NONE" | "DASHBOARD" | "MY_WORK" | "BOARD" | "TEAMS" | "PROJECTS"
  filter: "NONE" | "OVERDUE" | "PRIORITY" | "STATUS"
  value: "NONE" | "HIGH" | "MEDIUM" | "LOW" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE"
}

const API_URL = import.meta.env.VITE_API_URL

export async function interpretVoiceIntent(transcript: string, accessToken: string) {
  let response: Response
  try {
    response = await fetch(`${API_URL}/api/assistant/interpret`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transcript }),
    })
  } catch {
    throw new Error("Could not reach the assistant service. Check your connection and try again.")
  }

  let result: ApiResponse<VoiceIntentResponse>
  try {
    result = await response.json() as ApiResponse<VoiceIntentResponse>
  } catch {
    throw new Error("The assistant service returned an unreadable response.")
  }

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || "The assistant service could not interpret that request.")
  }
  return result.data
}
