import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"

import { IssuesContext } from "@/contexts/issues"
import useAuth from "@/hooks/useAuth"
import type { Issue, IssueFormValues, IssueStatus } from "@/pages/issues/types"
import { issueApi, type IssueRecord } from "@/services/workspaceApi"

function issuePrefix(project: string) {
  const words = project.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return "ISS"
  if (words.length > 1) return words.map((word) => word[0]).join("").slice(0, 3).toUpperCase()
  return words[0].slice(0, 3).toUpperCase()
}

function previewIssues(): Issue[] {
  const dueDate = (daysFromToday: number) => {
    const date = new Date()
    date.setDate(date.getDate() + daysFromToday)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
  }

  return [
    { id: 1, key: "WORK-24", title: "Authentication callback loses state", description: "Preserve the return URL after successful sign-in.", project: "WorkSphere", status: "In progress", priority: "High", assignee: "Raman", dueDate: dueDate(0) },
    { id: 2, key: "DS-18", title: "Button focus ring contrast", description: "Increase focus-ring contrast in the dark palette.", project: "Design System", status: "Open", priority: "Medium", assignee: "Monika", dueDate: dueDate(1) },
    { id: 3, key: "MOB-12", title: "Push notification badge not clearing", description: "Update the badge after opening a notification.", project: "Mobile App", status: "Open", priority: "High", assignee: "Raman", dueDate: dueDate(3) },
    { id: 4, key: "WORK-21", title: "Project settings validation", description: "Validate required project metadata.", project: "WorkSphere", status: "Resolved", priority: "Low", assignee: "Jivesh Sharma", dueDate: "" },
  ]
}

export function IssuesProvider({ children }: { children: ReactNode }) {
  const { isDevelopmentPreview, accessToken, user } = useAuth()
  return (
    <IssuesSession key={isDevelopmentPreview ? "preview" : `account-${user?.id ?? "none"}`} preview={isDevelopmentPreview} accessToken={accessToken} userId={user?.id}>
      {children}
    </IssuesSession>
  )
}

function IssuesSession({ children, preview, accessToken, userId }: { children: ReactNode; preview: boolean; accessToken: string | null; userId?: number }) {
  const [issues, setIssues] = useState<Issue[]>(() =>
    import.meta.env.DEV && preview ? previewIssues() : [],
  )

  useEffect(() => {
    if (!accessToken || preview) return
    let active = true
    issueApi.list(accessToken).then((records) => { if (active) setIssues(records.map(toIssue)) }).catch(() => { if (active) setIssues([]) })
    return () => { active = false }
  }, [accessToken, preview])

  const createIssue = useCallback(async (values: IssueFormValues) => {
    if (accessToken && !preview) {
      const saved = await issueApi.create(accessToken, issueInput(values, userId))
      setIssues((current) => [toIssue(saved), ...current])
      return
    }
    setIssues((current) => {
      const prefix = issuePrefix(values.project)
      const highestNumber = current.reduce((highest, issue) => {
        const match = issue.key.match(new RegExp(`^${prefix}-(\\d+)$`))
        return match ? Math.max(highest, Number(match[1])) : highest
      }, 0)
      const nextId = current.reduce((highest, issue) => Math.max(highest, issue.id), 0) + 1
      return [{ ...values, id: nextId, key: `${prefix}-${highestNumber + 1}` }, ...current]
    })
  }, [accessToken, preview, userId])

  const updateIssue = useCallback(async (id: number, values: IssueFormValues) => {
    const existing = issues.find((issue) => issue.id === id)
    if (!existing) return
    if (accessToken && !preview) {
      const saved = await issueApi.update(accessToken, id, issueInput(values, userId))
      setIssues((current) => current.map((issue) => issue.id === id ? toIssue(saved) : issue))
      return
    }
    setIssues((current) => current.map((issue) => issue.id === id ? { ...issue, ...values } : issue))
  }, [accessToken, preview, userId, issues])

  const updateIssueStatus = useCallback(async (id: number, status: IssueStatus) => {
    const existing = issues.find((issue) => issue.id === id)
    if (!existing) return
    if (accessToken && !preview) {
      const saved = await issueApi.update(accessToken, id, issueInput({ ...existing, status }, userId))
      setIssues((current) => current.map((issue) => issue.id === id ? toIssue(saved) : issue))
      return
    }
    setIssues((current) => current.map((issue) => issue.id === id ? { ...issue, status } : issue))
  }, [accessToken, preview, userId, issues])

  const value = useMemo(
    () => ({ issues, createIssue, updateIssue, updateIssueStatus }),
    [issues, createIssue, updateIssue, updateIssueStatus],
  )

  return <IssuesContext.Provider value={value}>{children}</IssuesContext.Provider>
}

function toIssue(record: IssueRecord): Issue {
  const status = record.status === "IN_PROGRESS" ? "In progress" : record.status === "RESOLVED" ? "Resolved" : "Open"
  const priority = record.priority === "URGENT" ? "Critical" : record.priority === "HIGH" ? "High" : record.priority === "LOW" ? "Low" : "Medium"
  return { id: record.id, key: `ISS-${record.id}`, title: record.title, description: record.description ?? "", project: record.projectId ? `Project #${record.projectId}` : "", status, priority, assignee: record.assignedUserId ? `User #${record.assignedUserId}` : "", dueDate: "" }
}

function issueInput(values: IssueFormValues, actorUserId?: number) {
  const status = values.status === "In progress" ? "IN_PROGRESS" : values.status === "Resolved" ? "RESOLVED" : "OPEN"
  const priority = values.priority === "Critical" ? "URGENT" : values.priority.toUpperCase()
  return { title: values.title, description: values.description, type: "BUG", status, priority, actorUserId }
}
