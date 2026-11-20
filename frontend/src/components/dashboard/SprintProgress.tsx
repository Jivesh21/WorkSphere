import { useEffect, useState } from "react"
import { Target } from "lucide-react"
import { Link } from "react-router-dom"
import useAuth from "@/hooks/useAuth"
import { sprintApi, type SprintRecord } from "@/services/workspaceApi"

function SprintProgress() {
  const { accessToken, isDevelopmentPreview } = useAuth()
  const [sprints, setSprints] = useState<SprintRecord[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!accessToken || isDevelopmentPreview) { setLoading(false); return }
    let active = true
    sprintApi.list(accessToken).then((result) => { if (active) setSprints(result) }).catch(() => { if (active) setSprints([]) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [accessToken, isDevelopmentPreview])
  return (
    <section aria-labelledby="sprint-progress-title" className="overflow-hidden rounded-lg border border-border/80 bg-card text-card-foreground shadow-sm shadow-black/[0.025]">
      <header className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
        <div>
          <h3 id="sprint-progress-title" className="text-sm font-semibold tracking-tight">Sprint status</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Delivery cycle</p>
        </div>
        <span className="flex size-8 items-center justify-center rounded-md border border-border/70 bg-muted/50 text-muted-foreground"><Target className="size-3.5" aria-hidden="true" /></span>
      </header>
      <div className="flex min-h-24 items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1 text-xs text-muted-foreground">
          {loading ? "Loading sprints…" : sprints.length ? <><p className="truncate font-medium text-foreground">{sprints[0].name ?? `Sprint ${sprints[0].id}`}</p><p className="mt-1">{sprints[0].status ?? "Planned"}{sprints[0].startDate ? ` · ${sprints[0].startDate}` : ""}{sprints[0].endDate ? ` – ${sprints[0].endDate}` : ""}</p></> : isDevelopmentPreview ? "Sprint data is not shown in preview." : "No sprints found."}
        </div>
        <Link to="/board" className="shrink-0 rounded-sm text-xs font-medium text-primary outline-none transition-colors hover:text-primary/80 hover:underline focus-visible:ring-2 focus-visible:ring-ring">
          Open board
        </Link>
      </div>
    </section>
  )
}

export default SprintProgress
