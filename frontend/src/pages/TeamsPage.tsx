import { useMemo, useState } from "react"
import {
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  Users,
} from "lucide-react"

import DashboardLayout from "@/components/layout/DashboardLayout"

type MemberRole = "Admin" | "Developer" | "Designer"
type MemberStatus = "Available" | "Busy" | "Away"

interface TeamMember {
  id: number
  name: string
  initials: string
  role: MemberRole
  status: MemberStatus
  email: string
  projects: number
  tasks: number
  completedTasks: number
  workload: number
}

const initialMembers: TeamMember[] = [
  {
    id: 1,
    name: "Jivesh Sharma",
    initials: "JS",
    role: "Admin",
    status: "Available",
    email: "jivesh@worksphere.dev",
    projects: 5,
    tasks: 18,
    completedTasks: 9,
    workload: 68,
  },
  {
    id: 2,
    name: "Raman",
    initials: "RA",
    role: "Developer",
    status: "Busy",
    email: "raman@worksphere.dev",
    projects: 3,
    tasks: 14,
    completedTasks: 7,
    workload: 82,
  },
  {
    id: 3,
    name: "Monika",
    initials: "MO",
    role: "Designer",
    status: "Available",
    email: "monika@worksphere.dev",
    projects: 3,
    tasks: 11,
    completedTasks: 8,
    workload: 54,
  },
]

const roleFilters = [
  "All",
  "Admin",
  "Developer",
  "Designer",
] as const

type RoleFilter = (typeof roleFilters)[number]

function TeamsPage() {
  const [members] = useState<TeamMember[]>(initialMembers)

  const [search, setSearch] = useState("")

  const [roleFilter, setRoleFilter] =
    useState<RoleFilter>("All")

  const [showRoleMenu, setShowRoleMenu] =
    useState(false)

  const visibleMembers = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase()

    return members.filter((member) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        member.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        member.email
          .toLowerCase()
          .includes(normalizedSearch)

      const matchesRole =
        roleFilter === "All" ||
        member.role === roleFilter

      return matchesSearch && matchesRole
    })
  }, [members, search, roleFilter])

  const availableMembers = members.filter(
    (member) => member.status === "Available",
  ).length

  const totalTasks = members.reduce(
    (total, member) => total + member.tasks,
    0,
  )

  const completedTasks = members.reduce(
    (total, member) => total + member.completedTasks,
    0,
  )

  const averageWorkload =
    members.length > 0
      ? Math.round(
          members.reduce(
            (total, member) => total + member.workload,
            0,
          ) / members.length,
        )
      : 0

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        {/* Header */}
        <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Workspace
            </p>

            <h1 className="mt-2 text-[32px] font-semibold tracking-[-0.045em] sm:text-[38px]">
              Teams
            </h1>

            <p className="mt-1.5 text-sm text-muted-foreground">
              Manage your team, workload, and collaboration.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-sm font-medium text-background transition hover:opacity-90"
          >
            <Plus className="size-4" />
            Invite member
          </button>
        </section>

        {/* Summary cards */}
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <SummaryCard
            icon={Users}
            label="Team members"
            value={String(members.length)}
            description="in your workspace"
          />

          <SummaryCard
            icon={Check}
            label="Available"
            value={String(availableMembers)}
            description="ready to work"
          />

          <SummaryCard
            icon={BriefcaseBusiness}
            label="Open tasks"
            value={String(totalTasks)}
            description={`${completedTasks} completed`}
          />

          <SummaryCard
            icon={CalendarDays}
            label="Avg. workload"
            value={`${averageWorkload}%`}
            description="across the team"
          />
        </section>

        {/* Team members */}
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-[360px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search team members..."
                className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground/30"
              />
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setShowRoleMenu(
                    (current) => !current,
                  )
                }
                className={[
                  "inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-medium transition",
                  roleFilter !== "All"
                    ? "border-foreground/30 bg-muted text-foreground"
                    : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                ].join(" ")}
              >
                Role
                <ChevronDown className="size-3.5" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 top-12 z-20 w-44 rounded-xl border border-border bg-card p-1.5 shadow-xl">
                  <p className="px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Filter by role
                  </p>

                  {roleFilters.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        setRoleFilter(role)
                        setShowRoleMenu(false)
                      }}
                      className={[
                        "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs transition",
                        roleFilter === role
                          ? "bg-muted font-medium text-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      ].join(" ")}
                    >
                      {role}

                      {roleFilter === role && (
                        <Check className="size-3.5" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop header */}
          <div className="hidden border-b border-border px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground lg:grid lg:grid-cols-[minmax(260px,1fr)_150px_120px_150px_140px_28px] lg:items-center lg:gap-4">
            <span>Member</span>
            <span>Role</span>
            <span>Projects</span>
            <span>Tasks</span>
            <span>Workload</span>
            <span />
          </div>

          {/* Members */}
          {visibleMembers.length > 0 ? (
            <div className="divide-y divide-border">
              {visibleMembers.map((member) => (
                <MemberRow
                  key={member.id}
                  member={member}
                />
              ))}
            </div>
          ) : (
            <EmptyState search={search} />
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: typeof Users
  label: string
  value: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          {label}
        </p>

        <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </div>
      </div>

      <p className="mt-4 text-2xl font-semibold tracking-[-0.04em]">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

function MemberRow({
  member,
}: {
  member: TeamMember
}) {
  const taskCompletion =
    member.tasks > 0
      ? Math.round(
          (member.completedTasks / member.tasks) * 100,
        )
      : 0

  return (
    <div className="group px-4 py-4 transition-colors hover:bg-muted/20 sm:px-5 lg:grid lg:grid-cols-[minmax(260px,1fr)_150px_120px_150px_140px_28px] lg:items-center lg:gap-4">
      {/* Member */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative shrink-0">
          <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-xs font-semibold">
            {member.initials}
          </div>

          <StatusDot status={member.status} />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {member.name}
          </p>

          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="size-3 shrink-0" />

            <span className="truncate">
              {member.email}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile details */}
      <div className="mt-4 grid grid-cols-2 gap-3 lg:contents">
        {/* Role */}
        <div className="flex flex-col gap-1 lg:block">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground lg:hidden">
            Role
          </span>

          <div className="flex items-center gap-2">
            <span className="w-fit rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium">
              {member.role}
            </span>

            <StatusBadge status={member.status} />
          </div>
        </div>

        {/* Projects */}
        <div className="flex flex-col gap-1 lg:block">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground lg:hidden">
            Projects
          </span>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <BriefcaseBusiness className="size-3.5" />
            <span>{member.projects}</span>
          </div>
        </div>

        {/* Tasks */}
        <div className="flex flex-col gap-1 lg:block">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground lg:hidden">
            Tasks
          </span>

          <div className="lg:pr-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">
                {member.completedTasks}/{member.tasks}
              </span>

              <span className="font-medium">
                {taskCompletion}%
              </span>
            </div>

            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground transition-[width] duration-500"
                style={{
                  width: `${taskCompletion}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Workload */}
        <div className="flex flex-col gap-1 lg:block">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground lg:hidden">
            Workload
          </span>

          <div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">
                Workload
              </span>

              <span className="font-medium">
                {member.workload}%
              </span>
            </div>

            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground transition-[width] duration-500"
                style={{
                  width: `${member.workload}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <button
          type="button"
          aria-label={`More options for ${member.name}`}
          className="hidden size-7 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground lg:flex"
        >
          <MoreHorizontal className="size-4" />
        </button>
      </div>
    </div>
  )
}

function StatusDot({
  status,
}: {
  status: MemberStatus
}) {
  const styles = {
    Available: "bg-emerald-400",
    Busy: "bg-amber-400",
    Away: "bg-muted-foreground",
  }

  return (
    <span
      className={[
        "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-card",
        styles[status],
      ].join(" ")}
    />
  )
}

function StatusBadge({
  status,
}: {
  status: MemberStatus
}) {
  const styles = {
    Available: "text-emerald-400",
    Busy: "text-amber-400",
    Away: "text-muted-foreground",
  }

  return (
    <span
      className={[
        "text-[10px] font-medium",
        styles[status],
      ].join(" ")}
    >
      {status}
    </span>
  )
}

function EmptyState({
  search,
}: {
  search: string
}) {
  return (
    <div className="px-6 py-14 text-center">
      <p className="text-sm font-medium">
        No team members found
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        {search
          ? `No members match "${search}".`
          : "There are no members in this view."}
      </p>
    </div>
  )
}

export default TeamsPage