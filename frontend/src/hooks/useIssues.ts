import { useContext } from "react"

import { IssuesContext } from "@/contexts/issues"

export default function useIssues() {
  const context = useContext(IssuesContext)
  if (!context) throw new Error("useIssues must be used inside IssuesProvider")
  return context
}
