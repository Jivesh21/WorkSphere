import { ArrowRight, ListChecks, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"
import useAuth from "@/hooks/useAuth"

function AssistantPreview() {
  const { isDevelopmentPreview } = useAuth()

  return (
    <section aria-labelledby="assistant-preview-title" className="relative min-w-0 overflow-hidden rounded-md border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-2.5">
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-0.5 bg-primary/70" />
      <div className="flex items-center gap-2.5">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary"><Sparkles className="size-3.5" aria-hidden="true" /></span>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <h2 id="assistant-preview-title" className="truncate text-xs font-semibold tracking-tight">AI Assistant</h2>
            <span className="shrink-0 rounded-full border border-primary/20 bg-primary/5 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-primary">{isDevelopmentPreview ? "Demo" : "Preview"}</span>
          </div>
          <p className="mt-0.5 truncate text-[10px] text-muted-foreground">Useful shortcuts for your workspace</p>
        </div>
        <ArrowRight className="size-3 shrink-0 text-primary" aria-hidden="true" />
      </div>
      <div className="mt-2 grid grid-cols-1 gap-1">
        <Link to="/work" className="flex h-8 items-center gap-1.5 rounded border border-border/80 bg-background/50 px-2.5 text-[10px] font-medium text-foreground outline-none transition-colors hover:border-primary/30 hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-ring">
          <ListChecks className="size-3 text-primary" aria-hidden="true" /> Review active tasks
        </Link>
        <Link to="/projects" className="flex h-8 items-center gap-1.5 rounded border border-border/80 bg-background/50 px-2.5 text-[10px] font-medium text-foreground outline-none transition-colors hover:border-primary/30 hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-ring">
          <Sparkles className="size-3 text-primary" aria-hidden="true" /> Browse project progress
        </Link>
      </div>
      <p className="mt-2 text-[9px] text-muted-foreground">AI suggestions are not connected yet.</p>
    </section>
  )
}

export default AssistantPreview
