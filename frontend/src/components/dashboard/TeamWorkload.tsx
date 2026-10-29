import { Users } from "lucide-react"
import { Link } from "react-router-dom"
import useAuth from "@/hooks/useAuth"

function TeamWorkload() {
  const { isDevelopmentPreview } = useAuth()
  const sampleMembers = [
    { name: "Jivesh Sharma", initials: "JS", tasks: 12, load: 80, color: "bg-violet-500" },
    { name: "Raman", initials: "R", tasks: 8, load: 60, color: "bg-blue-500" },
    { name: "Monika", initials: "M", tasks: 6, load: 40, color: "bg-pink-500" },
    { name: "Unassigned", initials: "?", tasks: 4, load: 20, color: "bg-slate-500" },
  ]

  return (
    <section aria-labelledby="team-workload-title" className="min-w-0 overflow-hidden rounded-md border border-border bg-card">
      <header className="flex items-center justify-between gap-3 border-b border-border px-3.5 py-2.5">
        <div>
          <h2 id="team-workload-title" className="text-sm leading-tight font-semibold">Team workload</h2>
          <p className="mt-1 text-[11px] leading-tight text-muted-foreground">{isDevelopmentPreview ? "Sample preview data" : "Workspace-wide assignments"}</p>
        </div>
        {isDevelopmentPreview && <Link to="/teams" className="text-xs font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">View all</Link>}
      </header>
      {isDevelopmentPreview ? (
        <ul className="space-y-3 px-3.5 py-3">
          {sampleMembers.map((member) => (
            <li key={member.name} className="flex min-w-0 items-center gap-2.5">
              <span className={`flex size-7 shrink-0 items-center justify-center rounded-full ${member.color} text-[10px] font-semibold text-white`}>{member.initials}</span>
              <span className="w-[100px] min-w-0 shrink-0">
                <span className="block truncate text-xs leading-tight font-medium">{member.name}</span>
                <span className="mt-0.5 block text-[10px] leading-tight text-muted-foreground">{member.tasks} tasks</span>
              </span>
              <span role="progressbar" aria-label={`${member.name} sample workload`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={member.load} className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                <span className={`block h-full rounded-full ${member.color}`} style={{ width: `${member.load}%` }} />
              </span>
              <span className="w-8 shrink-0 text-right text-[10px] tabular-nums text-muted-foreground">{member.load}%</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex min-h-16 items-center gap-2.5 px-3.5 py-3">
          <Users className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <p className="text-xs leading-relaxed text-muted-foreground">Team membership and shared assignment data aren’t connected; team totals aren’t available.</p>
          <Link to="/teams" className="shrink-0 text-[10px] font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">Teams</Link>
        </div>
      )}
    </section>
  )
}

export default TeamWorkload
