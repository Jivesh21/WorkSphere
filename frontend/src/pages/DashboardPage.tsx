import {
  AlertTriangle,
  BriefcaseBusiness,
  CheckCheck,
  ListChecks,
} from "lucide-react"
import { Link } from "react-router-dom"
import * as m from "motion/react-m"

import ActiveProjects from "@/components/dashboard/ActiveProjects"
import AssistantPreview from "@/components/dashboard/AssistantPreview"
import MyTasks from "@/components/dashboard/MyTasks"
import ProjectActivityChart from "@/components/dashboard/ProjectActivityChart"
import StatCard from "@/components/dashboard/StatCard"
import TeamWorkload from "@/components/dashboard/TeamWorkload"
import UpcomingDeadlines from "@/components/dashboard/UpcomingDeadlines"
import WorkCalendar from "@/components/dashboard/WorkCalendar"
import DashboardLayout from "@/components/layout/DashboardLayout"
import useAuth from "@/hooks/useAuth"
import useIssues from "@/hooks/useIssues"
import useProjects from "@/hooks/useProjects"
import useTasks from "@/hooks/useTasks"
import { staggerContainer, staggerItem } from "@/lib/motion"

function DashboardPage() {
  const { user } = useAuth()
  const { issues } = useIssues()
  const { projects } = useProjects()
  const { tasks } = useTasks()
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour >= 5 && hour < 12
    ? "Good morning"
    : hour >= 12 && hour < 17
      ? "Good afternoon"
      : hour >= 17 && hour < 21
        ? "Good evening"
        : "Good night"
  const displayName = user?.name.trim()
  const formattedDate = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(now)
  const activeProjects = projects.filter((project) => project.status === "Active")
  const openIssues = issues.filter((issue) => issue.status !== "Resolved")
  const resolvedIssues = issues.filter((issue) => issue.status === "Resolved")
  const openTasks = tasks.filter((task) => task.status !== "DONE")
  const completedTasks = tasks.filter((task) => task.status === "DONE")

  return (
    <DashboardLayout>
      <m.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="mx-auto w-full max-w-[1500px] space-y-2.5 pb-8"
      >
        <m.header
          variants={staggerItem}
          className="relative flex min-h-[70px] items-center justify-between gap-4 overflow-hidden rounded-md border border-primary/15 bg-[radial-gradient(ellipse_at_78%_15%,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_48%),linear-gradient(105deg,var(--card)_45%,color-mix(in_oklch,var(--primary)_9%,var(--card)))] px-4 py-2.5 sm:px-4"
        >
          <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-7 bg-gradient-to-t from-primary/5 to-transparent" />
          <span aria-hidden="true" className="pointer-events-none absolute -right-4 bottom-0 h-12 w-[44%] bg-[linear-gradient(155deg,transparent_38%,color-mix(in_oklch,var(--primary)_14%,transparent)_39%,transparent_58%),linear-gradient(25deg,transparent_45%,color-mix(in_oklch,var(--chart-1)_10%,transparent)_46%,transparent_70%)] opacity-70" />
          <div className="relative min-w-0">
            <p className="text-xs font-medium text-muted-foreground">{formattedDate}</p>
            <h1 className="mt-0.5 truncate text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-2xl">
              {displayName ? `${greeting}, ${displayName}` : greeting}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Here’s what’s happening in your workspace.</p>
          </div>
          <Link
            to="/work"
            className="relative inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-border/80 bg-card/80 px-3 text-xs font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ListChecks className="size-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">My work</span>
          </Link>
        </m.header>

        <m.section variants={staggerItem} aria-label="Workspace metrics">
          <m.div variants={staggerContainer} className="grid min-w-0 grid-cols-2 gap-2 md:grid-cols-4">
            <m.div variants={staggerItem}><StatCard label="Active projects" value={String(activeProjects.length)} description={projects.length ? `${projects.length} total` : "Session only"} icon={BriefcaseBusiness} chartValues={[projects.filter((project) => project.status === "Active").length, projects.filter((project) => project.status === "Planning").length, projects.filter((project) => project.status === "Completed").length]} color="violet" /></m.div>
            <m.div variants={staggerItem}><StatCard label="Open tasks" value={String(openTasks.length)} description="My Work" icon={ListChecks} chartValues={["TODO", "IN_PROGRESS", "IN_REVIEW"].map((status) => tasks.filter((task) => task.status === status).length)} color="blue" /></m.div>
            <m.div variants={staggerItem}><StatCard label="Completed tasks" value={String(completedTasks.length)} description="My Work" icon={CheckCheck} chartValues={["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"].map((status) => tasks.filter((task) => task.status === status).length)} color="green" /></m.div>
            <m.div variants={staggerItem}><StatCard label="Open issues" value={String(openIssues.length)} description={`${resolvedIssues.length} resolved`} icon={AlertTriangle} chartValues={["Open", "In progress", "Resolved"].map((status) => issues.filter((issue) => issue.status === status).length)} color="rose" /></m.div>
          </m.div>
          <p className="sr-only">Counts reflect data available in this session.</p>
        </m.section>

        <m.div
          variants={staggerItem}
          className="grid min-w-0 items-start gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.8fr)_minmax(220px,0.92fr)_minmax(190px,0.78fr)] 2xl:grid-cols-[minmax(0,1.9fr)_minmax(245px,0.96fr)_minmax(215px,0.8fr)]"
        >
          <div className="grid min-w-0 content-start gap-3">
            <MyTasks />
            <ProjectActivityChart />
          </div>
          <div className="grid min-w-0 content-start gap-3">
            <ActiveProjects />
            <TeamWorkload />
          </div>
          <aside className="grid min-w-0 gap-2.5 sm:grid-cols-2 md:col-span-2 xl:col-span-1 xl:grid-cols-1" aria-label="Workspace widgets">
            <WorkCalendar />
            <section aria-labelledby="issue-deadlines-title" className="min-w-0">
              <header className="mb-1 flex items-center justify-between gap-2 px-0.5">
                <h2 id="issue-deadlines-title" className="text-sm font-semibold">Upcoming deadlines</h2>
                <Link to="/issues" className="rounded-sm text-xs font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">View all</Link>
              </header>
              <UpcomingDeadlines />
            </section>
            <AssistantPreview />
          </aside>
        </m.div>

      </m.div>
    </DashboardLayout>
  )
}

export default DashboardPage
