import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  ChevronDown,
  ChevronLeft,
  CircleHelp,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  MoreHorizontal,
  Settings,
  ShieldAlert,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"

const mainNavigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "My Work",
    href: "/work",
    icon: ListChecks,
  },
]

const workspaceNavigation = [
  {
    label: "Workspace",
    href: "/workspace",
    icon: BriefcaseBusiness,
  },
  {
    label: "Projects",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    label: "Teams",
    href: "/teams",
    icon: Users,
  },
  {
    label: "Issues",
    href: "/issues",
    icon: ShieldAlert,
  },
  {
    label: "Sprints",
    href: "/sprints",
    icon: Workflow,
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
    badge: 4,
  },
]

const insightNavigation = [
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

function Sidebar() {
  const location = useLocation()

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return location.pathname === "/dashboard"
    }

    return location.pathname.startsWith(href)
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-[280px] flex-col border-r border-white/[0.08] bg-[#0b0b0b] text-white shadow-[10px_0_28px_rgba(0,0,0,0.18)] lg:flex">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#0b0b0b]/80 px-4">
        <Link
          to="/dashboard"
          className="flex min-w-0 items-center gap-3 rounded-md px-1.5 py-1 text-left outline-none transition-colors hover:bg-white/[0.055] focus-visible:ring-2 focus-visible:ring-white/20"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/5 text-white shadow">
            <Sparkles
              className="size-[18px]"
              strokeWidth={2.2}
            />
          </div>

          <div className="min-w-0 leading-none">
            <p className="text-[15px] font-semibold tracking-tight">
              WorkSphere
            </p>

            <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.18em] text-white/35">
              Productivity
            </p>
          </div>
        </Link>

        <button
          type="button"
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-white/40 outline-none transition-colors hover:bg-white/[0.055] hover:text-white focus-visible:ring-2 focus-visible:ring-white/20"
          aria-label="Collapse sidebar"
        >
          <ChevronLeft
            className="size-4"
            strokeWidth={2}
          />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <button
          type="button"
          className="group mb-7 flex w-full items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3 text-left outline-none transition-colors hover:border-white/[0.12] hover:bg-white/[0.055] focus-visible:ring-2 focus-visible:ring-white/20"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-semibold text-black">
            W
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold">
              WorkSphere Workspace
            </p>

            <p className="mt-1 text-[11px] text-white/40">
              Team workspace
            </p>
          </div>

          <ChevronDown className="size-3.5 shrink-0 text-white/35 transition-transform group-hover:rotate-180" />
        </button>

        <NavigationSection
          title="Overview"
          items={mainNavigation}
          isActive={isActive}
        />

        <NavigationSection
          title="Workspace"
          items={workspaceNavigation}
          isActive={isActive}
        />

        <NavigationSection
          title="Insights"
          items={insightNavigation}
          isActive={isActive}
        />

        <div className="mt-6">
          <NavItem
            label="Help & Support"
            href="/help"
            icon={CircleHelp}
            active={isActive("/help")}
          />
        </div>
      </div>

      <div className="shrink-0 border-t border-white/[0.08] bg-[#0b0b0b]/80 p-3">
        <button
          type="button"
          className="group flex w-full items-center gap-3 rounded-xl p-2 text-left outline-none transition-colors hover:bg-white/[0.055] focus-visible:ring-2 focus-visible:ring-white/20"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/[0.1] text-xs font-semibold text-white">
            JS
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold">
              Jivesh Sharma
            </p>

            <p className="mt-0.5 text-[11px] text-white/40">
              Administrator
            </p>
          </div>

          <MoreHorizontal className="size-4 shrink-0 text-white/35 transition-colors group-hover:text-white/70" />
        </button>
      </div>
    </aside>
  )
}

interface NavigationSectionProps {
  title: string
  items: {
    label: string
    href: string
    icon: typeof LayoutDashboard
    badge?: number
  }[]
  isActive: (href: string) => boolean
}

function NavigationSection({
  title,
  items,
  isActive,
}: NavigationSectionProps) {
  return (
    <section className="mb-7" aria-label={title}>
      <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">
        {title}
      </p>

      <nav className="space-y-1">
        {items.map((item) => (
          <NavItem
            key={item.href}
            label={item.label}
            href={item.href}
            icon={item.icon}
            badge={item.badge}
            active={isActive(item.href)}
          />
        ))}
      </nav>
    </section>
  )
}

interface NavItemProps {
  label: string
  href: string
  icon: typeof LayoutDashboard
  active?: boolean
  badge?: number
}

function NavItem({
  label,
  href,
  icon: Icon,
  active = false,
  badge,
}: NavItemProps) {
  return (
    <Link
      to={href}
      aria-current={active ? "page" : undefined}
      className={[
        "group flex h-9 w-full items-center gap-3 rounded-lg border-l-2 border-transparent px-3 text-[13px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-white/20",
        active
          ? "border-l-white/60 bg-white/[0.03] text-white"
          : "text-white/55 hover:bg-white/[0.055] hover:text-white",
      ].join(" ")}
    >
      <Icon
        className={[
          "size-[17px] shrink-0 transition-colors",
          active
            ? "text-white"
            : "text-white/40 group-hover:text-white/80",
        ].join(" ")}
        strokeWidth={1.8}
      />

      <span className="min-w-0 flex-1 truncate">
        {label}
      </span>

      {badge !== undefined && (
        <span
          className={[
            "flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
            active
              ? "bg-white/15 text-white"
              : "bg-red-500/15 text-red-300",
          ].join(" ")}
        >
          {badge}
        </span>
      )}
    </Link>
  )
}

export default Sidebar
