export const issueStatuses = ["Open", "In progress", "Resolved"] as const
export type IssueStatus = (typeof issueStatuses)[number]

export const issuePriorities = ["Critical", "High", "Medium", "Low"] as const
export type IssuePriority = (typeof issuePriorities)[number]

export interface Issue {
  id: number
  key: string
  title: string
  description: string
  project: string
  status: IssueStatus
  priority: IssuePriority
  assignee: string
  dueDate: string
}

export type IssueFormValues = Omit<Issue, "id" | "key">
