import { useState, type FormEvent } from "react"
import { X } from "lucide-react"

import type {
  Project,
  ProjectHealth,
  ProjectStatus,
} from "@/constants/projects"

interface CreateProjectModalProps {
  open: boolean
  onClose: () => void
  onCreate: (project: Project) => void
}

function CreateProjectModal({
  open,
  onClose,
  onCreate,
}: CreateProjectModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] =
    useState<ProjectStatus>("Planning")
  const [health, setHealth] =
    useState<ProjectHealth>("On track")
  const [dueDate, setDueDate] = useState("")

  if (!open) {
    return null
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const trimmedName = name.trim()

    if (!trimmedName) {
      return
    }

    const code = trimmedName
      .split(/\s+/)
      .map((word) => word[0])
      .join("")
      .slice(0, 3)
      .toUpperCase()

    const newProject: Project = {
      id: Date.now(),
      name: trimmedName,
      code: code || "PRJ",
      description:
        description.trim() ||
        "New project in the workspace",
      color: "bg-cyan-500",
      status,
      health,
      progress: 0,
      completedTasks: 0,
      totalTasks: 0,
      members: 1,
      dueDate: dueDate
        ? new Date(
            `${dueDate}T00:00:00`,
          ).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
          })
        : "No due date",
    }

    onCreate(newProject)

    setName("")
    setDescription("")
    setStatus("Planning")
    setHealth("On track")
    setDueDate("")
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold">
              Create project
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Add a new project to your workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 p-5">
            {/* Name */}
            <div>
              <label
                htmlFor="project-name"
                className="mb-1.5 block text-xs font-medium"
              >
                Project name
              </label>

              <input
                id="project-name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="e.g. Mobile App"
                required
                autoFocus
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground/30"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="project-description"
                className="mb-1.5 block text-xs font-medium"
              >
                Description
              </label>

              <textarea
                id="project-description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="What is this project about?"
                rows={3}
                className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground/30"
              />
            </div>

            {/* Status + Health */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="project-status"
                  className="mb-1.5 block text-xs font-medium"
                >
                  Status
                </label>

                <select
                  id="project-status"
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target.value as ProjectStatus,
                    )
                  }
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-foreground/30"
                >
                  <option value="Planning">
                    Planning
                  </option>

                  <option value="Active">
                    Active
                  </option>

                  <option value="Completed">
                    Completed
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="project-health"
                  className="mb-1.5 block text-xs font-medium"
                >
                  Health
                </label>

                <select
                  id="project-health"
                  value={health}
                  onChange={(event) =>
                    setHealth(
                      event.target.value as ProjectHealth,
                    )
                  }
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-foreground/30"
                >
                  <option value="On track">
                    On track
                  </option>

                  <option value="At risk">
                    At risk
                  </option>
                </select>
              </div>
            </div>

            {/* Due date */}
            <div>
              <label
                htmlFor="project-due-date"
                className="mb-1.5 block text-xs font-medium"
              >
                Due date
              </label>

              <input
                id="project-due-date"
                type="date"
                value={dueDate}
                onChange={(event) =>
                  setDueDate(event.target.value)
                }
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-foreground/30"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg border border-border px-4 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="h-9 rounded-lg bg-foreground px-4 text-xs font-medium text-background transition hover:opacity-90"
            >
              Create project
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateProjectModal