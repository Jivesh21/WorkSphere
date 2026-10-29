import type { PriorityFilter, TaskStatusFilter } from "@/pages/MyWorkPage/types"

export type TaskVoiceFilter =
  | { kind: "priority"; value: PriorityFilter }
  | { kind: "status"; value: TaskStatusFilter }
  | { kind: "overdue" }

export type VoiceCommand =
  | { kind: "navigate"; path: string; label: string }
  | { kind: "filter-tasks"; filter: TaskVoiceFilter; label: string }

export type InterpretedVoiceIntent =
  | { kind: "command"; command: VoiceCommand }
  | { kind: "unsupported" }
  | { kind: "clarification-required" }

export function normalizeVoiceCommand(text: string) {
  return text.toLocaleLowerCase().trim().replace(/[.!?,;:]+$/g, "").replace(/\s+/g, " ")
}

export function resolveVoiceCommand(text: string): VoiceCommand | undefined {
  const normalized = normalizeVoiceCommand(text).replace(/-/g, " ")

  if (/^(show|open|go to|take me to) (my )?(overdue )tasks$/.test(normalized)) {
    return { kind: "filter-tasks", filter: { kind: "overdue" }, label: "overdue tasks in My Work" }
  }

  const priorityMatch = normalized.match(/^(show|open|go to) (my )?(high|medium|low)( priority)? tasks$/)
  if (priorityMatch) {
    const priority = priorityMatch[3].toUpperCase() as Exclude<PriorityFilter, "All">
    return { kind: "filter-tasks", filter: { kind: "priority", value: priority }, label: `${priority.toLowerCase()} priority tasks in My Work` }
  }

  if (/^(show|open|go to) (my )?(completed|done) tasks$/.test(normalized)) {
    return { kind: "filter-tasks", filter: { kind: "status", value: "DONE" }, label: "completed tasks in My Work" }
  }

  const routes = [
    { path: "/dashboard", label: "Dashboard", aliases: ["dashboard", "the dashboard"] },
    { path: "/work", label: "My Work", aliases: ["my work", "work"] },
    { path: "/board", label: "Board", aliases: ["board", "the board"] },
    { path: "/teams", label: "Teams", aliases: ["teams", "team"] },
    { path: "/projects", label: "Projects", aliases: ["projects", "project", "my projects"] },
  ]
  for (const route of routes) {
    const prefixes = ["open", "go to", "show", "take me to"]
    if (route.aliases.some((alias) => prefixes.some((prefix) => normalized === `${prefix} ${alias}`))) {
      return { kind: "navigate", path: route.path, label: route.label }
    }
  }
  return undefined
}

export function mapGeminiVoiceIntent(value: unknown): InterpretedVoiceIntent | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined
  const intent = value as Record<string, unknown>
  const fields = ["intent", "destination", "filter", "value"]
  if (Object.keys(intent).length !== fields.length || fields.some((field) => typeof intent[field] !== "string")) return undefined

  if (intent.intent === "UNSUPPORTED" && intent.destination === "NONE" && intent.filter === "NONE" && intent.value === "NONE") {
    return { kind: "unsupported" }
  }
  if (intent.intent === "CLARIFICATION_REQUIRED" && intent.destination === "NONE" && intent.filter === "NONE" && intent.value === "NONE") {
    return { kind: "clarification-required" }
  }

  if (intent.intent === "NAVIGATE" && intent.filter === "NONE" && intent.value === "NONE") {
    const destinations: Record<string, { path: string; label: string }> = {
      DASHBOARD: { path: "/dashboard", label: "Dashboard" },
      MY_WORK: { path: "/work", label: "My Work" },
      BOARD: { path: "/board", label: "Board" },
      TEAMS: { path: "/teams", label: "Teams" },
      PROJECTS: { path: "/projects", label: "Projects" },
    }
    const destination = destinations[String(intent.destination)]
    return destination ? { kind: "command", command: { kind: "navigate", ...destination } } : undefined
  }

  if (intent.intent === "FILTER_TASKS" && intent.destination === "MY_WORK") {
    if (intent.filter === "OVERDUE" && intent.value === "NONE") {
      return { kind: "command", command: { kind: "filter-tasks", filter: { kind: "overdue" }, label: "overdue tasks in My Work" } }
    }
    if (intent.filter === "PRIORITY" && (intent.value === "HIGH" || intent.value === "MEDIUM" || intent.value === "LOW")) {
      const priority = intent.value
      return { kind: "command", command: { kind: "filter-tasks", filter: { kind: "priority", value: priority }, label: `${priority.toLowerCase()} priority tasks in My Work` } }
    }
    const statuses = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"] as const
    if (intent.filter === "STATUS" && statuses.includes(intent.value as typeof statuses[number])) {
      const status = intent.value as typeof statuses[number]
      return { kind: "command", command: { kind: "filter-tasks", filter: { kind: "status", value: status }, label: `${status === "DONE" ? "completed" : status.toLowerCase().replaceAll("_", " ")} tasks in My Work` } }
    }
  }
  return undefined
}
