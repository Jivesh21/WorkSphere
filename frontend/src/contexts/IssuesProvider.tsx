import { useCallback, useMemo, useState, type ReactNode } from "react"

import { IssuesContext } from "@/contexts/issues"
import useAuth from "@/hooks/useAuth"
import type { Issue, IssueFormValues, IssueStatus } from "@/pages/issues/types"

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
  const { isDevelopmentPreview } = useAuth()
  return (
    <IssuesSession key={isDevelopmentPreview ? "preview" : "account"} preview={isDevelopmentPreview}>
      {children}
    </IssuesSession>
  )
}

function IssuesSession({ children, preview }: { children: ReactNode; preview: boolean }) {
  const [issues, setIssues] = useState<Issue[]>(() =>
    import.meta.env.DEV && preview ? previewIssues() : [],
  )

  const createIssue = useCallback((values: IssueFormValues) => {
    setIssues((current) => {
      const prefix = issuePrefix(values.project)
      const highestNumber = current.reduce((highest, issue) => {
        const match = issue.key.match(new RegExp(`^${prefix}-(\\d+)$`))
        return match ? Math.max(highest, Number(match[1])) : highest
      }, 0)
      const nextId = current.reduce((highest, issue) => Math.max(highest, issue.id), 0) + 1
      return [{ ...values, id: nextId, key: `${prefix}-${highestNumber + 1}` }, ...current]
    })
  }, [])

  const updateIssue = useCallback((id: number, values: IssueFormValues) => {
    setIssues((current) => current.map((issue) => issue.id === id ? { ...issue, ...values } : issue))
  }, [])

  const updateIssueStatus = useCallback((id: number, status: IssueStatus) => {
    setIssues((current) => current.map((issue) => issue.id === id ? { ...issue, status } : issue))
  }, [])

  const value = useMemo(
    () => ({ issues, createIssue, updateIssue, updateIssueStatus }),
    [issues, createIssue, updateIssue, updateIssueStatus],
  )

  return <IssuesContext.Provider value={value}>{children}</IssuesContext.Provider>
}
