import { useMemo } from "react"
import {
  Activity,
  AlertTriangle,
  BriefcaseBusiness,
  CalendarDays,
  ListChecks,
} from "lucide-react"

import ActiveProjects from "@/components/dashboard/ActiveProjects"
import ProjectActivityChart from "@/components/dashboard/ProjectActivityChart"
import SprintProgress from "@/components/dashboard/SprintProgress"
import StatCard from "@/components/dashboard/StatCard"
import DashboardLayout from "@/components/layout/DashboardLayout"

function DashboardPage() {
  const currentTime = useMemo(() => new Date(), [])

  const greeting = useMemo(() => {
    const hour = currentTime.getHours()

    if (hour >= 5 && hour < 12) {
      return "Good morning"
    }

    if (hour >= 12 && hour < 17) {
      return "Good afternoon"
    }

    if (hour >= 17 && hour < 21) {
      return "Good evening"
    }

    return "Good night"
  }, [currentTime])

  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat("en-IN", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(currentTime)
  }, [currentTime])

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        {/* Header */}
        <section className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              {formattedDate}
            </p>

            <h1 className="mt-2 text-[32px] font-semibold tracking-[-0.045em] sm:text-[38px]">
              {greeting}, Jivesh
            </h1>

            <p className="mt-1.5 text-sm text-muted-foreground">
              Here's what's happening across your workspace.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-fit items-center gap-2 rounded-xl border bg-card px-3.5 text-sm font-medium transition hover:bg-white/[0.04]"
          >
            <CalendarDays className="size-4 text-muted-foreground" />
            This week
          </button>
        </section>

        {/* KPI Cards */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Project health"
            value="82%"
            trend="6.4%"
            description="this month"
            icon={Activity}
            iconClassName="text-emerald-400"
          />

          <StatCard
            label="Active projects"
            value="12"
            trend="2"
            description="this month"
            icon={BriefcaseBusiness}
            iconClassName="text-sky-400"
          />

          <StatCard
            label="My open tasks"
            value="18"
            description="4 due this week"
            icon={ListChecks}
            iconClassName="text-amber-400"
          />

          <StatCard
            label="Critical issues"
            value="3"
            description="2 need attention"
            icon={AlertTriangle}
            iconClassName="text-red-400"
          />
        </section>

        {/* Activity + Sprint */}
        <section className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
          <ProjectActivityChart />

          <SprintProgress />
        </section>

        {/* Active Projects */}
        <section>
          <ActiveProjects />
        </section>
      </div>
    </DashboardLayout>
  )
}

export default DashboardPage