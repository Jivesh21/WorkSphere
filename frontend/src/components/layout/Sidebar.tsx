import { FolderKanban, Sparkles } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import * as m from "motion/react-m"

import useAuth from "@/hooks/useAuth"
import useProjects from "@/hooks/useProjects"
import { navigationSections, type NavigationSection } from "@/components/layout/navigation"

function getInitials(name: string) {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "?"
}

function Sidebar() {
  const location = useLocation()
  const { user, avatarPreview } = useAuth()
  const { projects } = useProjects()
  const displayName = user?.name?.trim() || "Signed in"

  const isActive = (href: string) => location.pathname === href

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-[224px] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-colors lg:flex">
      <div className="flex h-14 shrink-0 items-center border-b border-sidebar-border px-3">
        <Link to="/dashboard" className="flex min-w-0 items-center gap-2 rounded-md px-1 py-1 text-left outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground">
            <Sparkles className="size-3.5" strokeWidth={2} aria-hidden="true" />
          </span>
          <span className="min-w-0 leading-none">
            <span className="block text-sm font-semibold tracking-tight">WorkSphere</span>
            <span className="mt-0.5 block text-[9px] font-medium uppercase tracking-[0.14em] text-sidebar-foreground/55">Project workspace</span>
          </span>
        </Link>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2.5 py-4">
        {navigationSections.slice(0, 2).map((section) => (
          <NavigationGroup key={section.title} section={section} isActive={isActive} />
        ))}
        {projects.length > 0 && (
          <section className="mb-4" aria-label="Your projects">
            <div className="mb-1.5 flex items-center justify-between px-2">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/55">Your projects</h2>
              <Link to="/projects" aria-label="Add a project" className="rounded p-0.5 text-sidebar-foreground/60 outline-none hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring">+</Link>
            </div>
            <nav className="space-y-0.5" aria-label="Project navigation">
              {projects.slice(0, 6).map((project) => (
                <Link
                  key={project.id}
                  to="/projects"
                  aria-label={`${project.name}, projects`}
                  className="flex h-9 items-center gap-2.5 rounded-md px-2.5 text-xs font-medium text-sidebar-foreground/75 outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                >
                  <FolderKanban className="size-3.5 shrink-0 text-sidebar-foreground/60" aria-hidden="true" />
                  <span className="truncate">{project.name}</span>
                </Link>
              ))}
            </nav>
          </section>
        )}
        {navigationSections.slice(2).map((section) => (
          <NavigationGroup key={section.title} section={section} isActive={isActive} />
        ))}
      </div>

      <div className="shrink-0 border-t border-sidebar-border p-2.5">
        <div className="flex min-w-0 items-center gap-2.5 rounded-md px-1.5 py-2">
          <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground" aria-hidden="true">
            {avatarPreview ? <img src={avatarPreview} alt="" className="size-full object-cover" /> : getInitials(displayName)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-medium">{displayName}</span>
            <span className="mt-0.5 block truncate text-[11px] text-sidebar-foreground/60">{user?.email ?? "Account"}</span>
          </span>
        </div>
      </div>
    </aside>
  )
}

function NavigationGroup({ section, isActive }: { section: NavigationSection; isActive: (href: string) => boolean }) {
  return (
    <section className="mb-5" aria-label={section.title}>
      <h2 className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/55">{section.title}</h2>
      <nav className="space-y-1" aria-label={`${section.title} navigation`}>
        {section.items.map(({ label, href, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              to={href}
              aria-current={active ? "page" : undefined}
              className={`group relative flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring ${active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"}`}
            >
              {active && <m.span layoutId="sidebar-active-indicator" aria-hidden="true" transition={{ duration: 0.18, ease: "easeOut" }} className="absolute inset-y-1 left-0 w-0.5 rounded-r bg-sidebar-primary" />}
              <Icon className={`size-3.5 shrink-0 transition-colors duration-150 ${active ? "text-sidebar-primary" : "text-sidebar-foreground/65 group-hover:text-sidebar-foreground"}`} strokeWidth={1.8} aria-hidden="true" />
              <span className="truncate">{label}</span>
            </Link>
          )
        })}
      </nav>
    </section>
  )
}

export default Sidebar
