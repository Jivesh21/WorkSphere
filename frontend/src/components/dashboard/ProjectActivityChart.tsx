import { Activity } from "lucide-react"
import { Link } from "react-router-dom"
import useAuth from "@/hooks/useAuth"

function ProjectActivityChart() {
  const { isDevelopmentPreview } = useAuth()
  const previewActivity = [
    { person: "Raman", initials: "R", action: "updated", subject: "Implement authentication API", time: "2 min ago", color: "bg-violet-500" },
    { person: "Monika", initials: "M", action: "completed", subject: "Design token cleanup", time: "1 hour ago", color: "bg-emerald-500" },
    { person: "Jivesh Sharma", initials: "JS", action: "created a task", subject: "Fix real-time notification bug", time: "3 hours ago", color: "bg-blue-500" },
    { person: "Raman", initials: "R", action: "commented on", subject: "Database schema", time: "5 hours ago", color: "bg-amber-500" },
    { person: "Monika", initials: "M", action: "moved task to", subject: "In Review", time: "1 day ago", color: "bg-rose-500" },
  ]

  return (
    <section aria-labelledby="project-activity-title" className="min-w-0 overflow-hidden rounded-md border border-border bg-card text-card-foreground">
      <header className="flex items-center justify-between gap-3 border-b border-border px-3.5 py-2.5">
        <div>
          <h3 id="project-activity-title" className="text-sm leading-tight font-semibold tracking-tight">Recent activity</h3>
          <p className="mt-1 text-[11px] leading-tight text-muted-foreground">{isDevelopmentPreview ? "Sample preview activity" : "Workspace updates"}</p>
        </div>
        {isDevelopmentPreview && <Link to="/issues" className="text-xs font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">View all</Link>}
      </header>
      {isDevelopmentPreview ? (
        <ol className="divide-y divide-border/70 px-3">
          {previewActivity.map((item, index) => (
            <li key={`${item.person}-${item.subject}`} className="flex min-w-0 items-center gap-2.5 py-2">
              <span className={`relative flex size-7 shrink-0 items-center justify-center rounded-full ${item.color} text-[10px] font-semibold text-white`}>
                {index === 0 && <Activity className="absolute -left-1.5 -top-0.5 size-2.5 rounded-full bg-card p-0.5 text-primary" aria-hidden="true" />}
                {item.initials}
              </span>
              <p className="min-w-0 flex-1 truncate text-xs leading-tight text-muted-foreground">
                <span className="font-medium text-foreground">{item.person}</span> {item.action} <span className="font-medium text-foreground">{item.subject}</span>
              </p>
              <span className="shrink-0 text-[10px] text-muted-foreground">{item.time}</span>
            </li>
          ))}
        </ol>
      ) : (
        <div className="flex min-h-16 items-center gap-2.5 px-3.5 py-3">
          <Activity className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <p className="text-xs leading-relaxed text-muted-foreground">Activity records aren’t available to this workspace yet.</p>
        </div>
      )}
    </section>
  )
}

export default ProjectActivityChart
