import { createContext } from "react"

import type { Issue, IssueFormValues, IssueStatus } from "@/pages/issues/types"

export interface IssuesContextValue {
  issues: Issue[]
  createIssue: (values: IssueFormValues) => void | Promise<void>
  updateIssue: (id: number, values: IssueFormValues) => void | Promise<void>
  updateIssueStatus: (id: number, status: IssueStatus) => void | Promise<void>
}

export const IssuesContext = createContext<IssuesContextValue | null>(null)
