import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CircleHelp,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
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
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-[308px] flex-col border-r border-white/[0.08] bg-[#0b0b0b] text-white lg:flex">
      {/* Brand */}
      <div className="flex h-[70px] shrink-0 items-center justify-between border-b border-white/[0.08] px-5">
        <Link
          to="/dashboard"
          className="flex items-center gap-3"
        >
          <div className="flex size-9 items-center justify-center rounded-xl bg-white text-black">
            <Sparkles
              className="size-[18px]"
              strokeWidth={2.2}
            />
          </div>

          <div className="leading-none">
            <p className="text-[15px] font-semibold tracking-tight">
              WorkSphere
            </p>

            <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/40">
              Work Management
            </p>
          </div>
        </Link>

        <button
          type="button"
          className="flex size-7 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/[0.06] hover:text-white"
          aria-label="Collapse sidebar"
        >
          <span className="text-sm">‹</span>
        </button>
      </div>

      {/* Navigation */}
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
        {/* Workspace switcher */}
        <button
          type="button"
          className="mb-7 flex w-full items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3 text-left transition hover:bg-white/[0.05]"
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

          <span className="text-xs text-white/40">
            ˅
          </span>
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

        <div className="mt-7">
          <NavItem
            label="Help & Support"
            href="/help"
            icon={CircleHelp}
            active={isActive("/help")}
          />
        </div>
      </div>

      {/* User — always at bottom */}
      <div className="shrink-0 border-t border-white/[0.08] p-3">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl p-2 transition hover:bg-white/[0.05]"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/[0.1] text-xs font-semibold">
            JS
          </div>

          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-[13px] font-semibold">
              Jivesh Sharma
            </p>

            <p className="mt-0.5 text-[11px] text-white/40">
              Administrator
            </p>
          </div>

          <span className="text-lg leading-none tracking-[0.1em] text-white/30">
            ···
          </span>
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
    <section className="mb-7">
      <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
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
      className={[
        "group flex h-10 items-center gap-3 rounded-xl px-3 text-[13px] font-medium transition-all",
        active
          ? "bg-white text-black"
          : "text-white/55 hover:bg-white/[0.055] hover:text-white",
      ].join(" ")}
    >
      <Icon
        className={[
          "size-[17px] shrink-0 transition-colors",
          active
            ? "text-black"
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
              ? "bg-black/10 text-black"
              : "bg-red-500/15 text-red-400",
          ].join(" ")}
        >
          {badge}
        </span>
      )}
    </Link>
  )
}

export default Sidebar