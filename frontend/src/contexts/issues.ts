import { createContext } from "react"

import type { Issue, IssueFormValues, IssueStatus } from "@/pages/issues/types"

export interface IssuesContextValue {
  issues: Issue[]
  createIssue: (values: IssueFormValues) => void
  updateIssue: (id: number, values: IssueFormValues) => void
  updateIssueStatus: (id: number, status: IssueStatus) => void
}

export const IssuesContext = createContext<IssuesContextValue | null>(null)
