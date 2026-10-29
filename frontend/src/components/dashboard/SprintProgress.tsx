import { Target } from "lucide-react"
import { Link } from "react-router-dom"

function SprintProgress() {
  return (
    <section aria-labelledby="sprint-progress-title" className="overflow-hidden rounded-lg border border-border/80 bg-card text-card-foreground shadow-sm shadow-black/[0.025]">
      <header className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
        <div>
          <h3 id="sprint-progress-title" className="text-sm font-semibold tracking-tight">Sprint status</h3>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Delivery cycle</p>
        </div>
        <span className="flex size-8 items-center justify-center rounded-md border border-border/70 bg-muted/50 text-muted-foreground"><Target className="size-3.5" aria-hidden="true" /></span>
      </header>
      <div className="flex min-h-24 items-center gap-3 px-4 py-3">
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          Sprint data is not connected to the dashboard yet.
        </p>
        <Link to="/board" className="shrink-0 rounded-sm text-[10px] font-medium text-primary outline-none transition-colors hover:text-primary/80 hover:underline focus-visible:ring-2 focus-visible:ring-ring">
          Open board
        </Link>
      </div>
    </section>
  )
}

export default SprintProgress
