import { useMemo, useState } from "react"
import type {
  TeamMember,
  RoleFilter,
} from "../types"

function useTeams() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("All")

  const filteredMembers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return members.filter((member) => {
      const matchesSearch =
        !normalizedSearch ||
        member.name.toLowerCase().includes(normalizedSearch) ||
        member.email.toLowerCase().includes(normalizedSearch)

      const matchesRole =
        roleFilter === "All" ||
        member.role === roleFilter

      return matchesSearch && matchesRole
    })
  }, [members, search, roleFilter])

  const availableMembers = useMemo(
    () =>
      members.filter(
        (member) => member.status === "Available",
      ).length,
    [members],
  )

  const totalTasks = useMemo(
    () =>
      members.reduce(
        (total, member) => total + member.tasks,
        0,
      ),
    [members],
  )

  const completedTasks = useMemo(
    () =>
      members.reduce(
        (total, member) => total + member.completedTasks,
        0,
      ),
    [members],
  )

  const averageWorkload = useMemo(() => {
    if (members.length === 0) {
      return 0
    }

    const totalWorkload = members.reduce(
      (total, member) => total + member.workload,
      0,
    )

    return Math.round(totalWorkload / members.length)
  }, [members])

  const addMember = (member: TeamMember) => {
    setMembers((currentMembers) => [
      ...currentMembers,
      member,
    ])
  }

  const removeMember = (memberId: string) => {
    setMembers((currentMembers) =>
      currentMembers.filter(
        (member) => member.id !== memberId,
      ),
    )
  }

  return {
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
    addMember,
    removeMember,
  }
}

export default useTeams