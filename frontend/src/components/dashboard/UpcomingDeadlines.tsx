import {
  ArrowUpRight,
  CircleAlert,
  Clock3,
} from "lucide-react"
interface Deadline {
  id: number
  title: string
  project: string
  date: string
  time: string
  priority: "High" | "Medium" | "Low"
}

const deadlines: Deadline[] = [
  {
    id: 1,
    title: "API documentation review",
    project: "Nimbus API",
    date: "Aug 27",
    time: "10:00 AM",
    priority: "High",
  },
  {
    id: 2,
    title: "Sprint release testing",
    project: "Atlas Mobile",
    date: "Aug 29",
    time: "2:30 PM",
    priority: "High",
  },
  {
    id: 3,
    title: "Dashboard wireframes",
    project: "Mercury Web",
    date: "Sep 01",
    time: "5:00 PM",
    priority: "Medium",
  },
  {
    id: 4,
    title: "Team retrospective",
    project: "WorkSphere",
    date: "Sep 03",
    time: "11:00 AM",
    priority: "Low",
  },
]

function UpcomingDeadlines() {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">
            Upcoming Deadlines
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Important work coming up
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          View all
          <ArrowUpRight className="size-3.5" />
        </button>
      </div>

      {/* Deadline list */}
      <div className="divide-y divide-border">
        {deadlines.map((deadline) => (
          <DeadlineItem
            key={deadline.id}
            deadline={deadline}
          />
        ))}
      </div>
    </section>
  )
}

function DeadlineItem({
  deadline,
}: {
  deadline: Deadline
}) {
  return (
    <div className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/20">
      {/* Date */}
      <div className="flex size-10 shrink-0 flex-col items-center justify-center rounded-lg bg-muted/50">
        <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
          {deadline.date.split(" ")[0]}
        </span>

        <span className="text-[11px] font-semibold leading-none">
          {deadline.date.split(" ")[1]}
        </span>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <p className="truncate text-[13px] font-semibold tracking-tight">
            {deadline.title}
          </p>

          <PriorityBadge priority={deadline.priority} />
        </div>

        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="truncate">
            {deadline.project}
          </span>

          <span className="size-0.5 shrink-0 rounded-full bg-muted-foreground/50" />

          <span className="flex shrink-0 items-center gap-1">
            <Clock3 className="size-3" />
            {deadline.time}
          </span>
        </div>
      </div>
    </div>
  )
}

function PriorityBadge({
  priority,
}: {
  priority: Deadline["priority"]
}) {
  const styles = {
    High: "bg-red-500/10 text-red-400",
    Medium: "bg-amber-500/10 text-amber-400",
    Low: "bg-emerald-500/10 text-emerald-400",
  }

  return (
    <span
      className={[
        "inline-flex shrink-0 items-center gap-1 rounded-full",
        "px-2 py-1 text-[9px] font-semibold",
        styles[priority],
      ].join(" ")}
    >
      {priority === "High" && (
        <CircleAlert className="size-2.5" />
      )}

      {priority}
    </span>
  )
}

export default UpcomingDeadlines