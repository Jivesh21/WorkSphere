import {
  BriefcaseBusiness,
  FolderKanban,
  Kanban,
  LayoutDashboard,
  ListChecks,
  ShieldAlert,
  Users,
  UserRound,
  Settings,
  type LucideIcon,
} from "lucide-react"

export interface NavigationItem {
  label: string
  href: string
  icon: LucideIcon
}

export interface NavigationSection {
  title: string
  items: NavigationItem[]
}

export const navigationSections: NavigationSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "My Work", href: "/work", icon: ListChecks },
    ],
  },
  {
    title: "Workspace",
    items: [
      { label: "Workspace", href: "/workspace", icon: BriefcaseBusiness },
      { label: "Projects", href: "/projects", icon: FolderKanban },
      { label: "Teams", href: "/teams", icon: Users },
      { label: "Issues", href: "/issues", icon: ShieldAlert },
      { label: "Board", href: "/board", icon: Kanban },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Profile", href: "/profile", icon: UserRound },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
]

export const mobileNavigation = navigationSections.flatMap((section) => section.items)
