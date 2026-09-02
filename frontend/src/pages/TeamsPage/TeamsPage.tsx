import {
  CheckCircle2,
  ClipboardList,
  UserPlus,
  Users,
} from "lucide-react"

import DashboardLayout from "@/components/layout/DashboardLayout"
import { roleFilters } from "./constants"
import EmptyState from "./components/EmptyState"
import MemberList from "./components/MemberList"
import TeamSummaryCard from "./components/TeamSummaryCard"
import TeamToolbar from "./components/TeamToolbar"
import useTeams from "./hooks/useTeams"

function TeamsPage() {
  const {
    members,
    filteredMembers,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    availableMembers,
    totalTasks,
    completedTasks,
    averageWorkload,
    removeMember,
  } = useTeams()

  const showEmptyState =
    members.length === 0

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Workspace
            </p>

            <h1 className="mt-2 text-[32px] font-semibold tracking-[-0.045em] sm:text-[38px]">
              Teams
            </h1>

            <p className="mt-1.5 text-sm text-muted-foreground">
              Manage your workspace team and track member workload.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <UserPlus className="h-4 w-4" />
            Invite member
          </button>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <TeamSummaryCard
            label="Team members"
            value={members.length}
            icon={Users}
            description="Members in this workspace"
          />

          <TeamSummaryCard
            label="Available"
            value={availableMembers}
            icon={CheckCircle2}
            description="Members currently available"
          />

          <TeamSummaryCard
            label="Total tasks"
            value={totalTasks}
            icon={ClipboardList}
            description="Tasks assigned to the team"
          />

          <TeamSummaryCard
            label="Average workload"
            value={averageWorkload}
            icon={ClipboardList}
            description="Average workload percentage"
          />
        </section>

        <section className="space-y-4">
          <TeamToolbar
            search={search}
            onSearchChange={setSearch}
            roleFilter={roleFilter}
            roleFilters={roleFilters}
            showRoleMenu={false}
            onToggleRoleMenu={() => {}}
            onRoleChange={setRoleFilter}
          />

          {showEmptyState ? (
            <EmptyState />
          ) : (
            <MemberList
              members={filteredMembers}
              onRemove={removeMember}
            />
          )}
        </section>

        <p className="text-xs text-muted-foreground">
          Completed tasks: {completedTasks}
        </p>
      </div>
    </DashboardLayout>
  )
}

export default TeamsPage