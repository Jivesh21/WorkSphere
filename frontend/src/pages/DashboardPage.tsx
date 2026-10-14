import { useMemo } from "react"
import {
  Activity,
  AlertTriangle,
  BriefcaseBusiness,
  CalendarDays,
  ListChecks,
} from "lucide-react"
import UpcomingDeadlines from "@/components/dashboard/UpcomingDeadlines"
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
      <div className="mx-auto w-full max-w-[1600px] space-y-8">
        {/* Header */}
        <section className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <p className="text-xs font-medium text-[#9A9AA2] tracking-wide uppercase">
              {formattedDate}
            </p>

            <h1 className="mt-2.5 text-[34px] font-semibold tracking-[-0.03em] text-[#F4F4F6] sm:text-[40px]">
              {greeting}, Jivesh
            </h1>

            <p className="mt-2 text-sm text-[#9A9AA2] leading-relaxed">
              Here's what's happening across your workspace.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-fit items-center gap-2 rounded-xl border border-white/10 bg-[#111113] px-4 text-sm font-medium text-[#9A9AA2] transition-colors hover:bg-white/5 hover:text-[#F4F4F6] hover:border-white/15"
          >
            <CalendarDays className="size-4" />
            This week
          </button>
        </section>

        {/* KPI Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
          <ProjectActivityChart />

          <SprintProgress />
        </section>

        {/* Projects + Deadlines */}
        <section className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
          <ActiveProjects />

          <UpcomingDeadlines />
        </section>
      </div>
    </DashboardLayout>
  )
}

export default DashboardPage