import { useState, type FormEvent } from "react"
import { X } from "lucide-react"
import { initialProjects } from "@/constants/projects"
type IssuePriority = "Critical" | "High" | "Medium" | "Low"

interface CreateIssueData {
  title: string
  description: string
  project: string
  priority: IssuePriority
  assignee: string
  dueDate: string
}

interface CreateIssueModalProps {
  open: boolean
  onClose: () => void
  onCreate: (issue: CreateIssueData) => void
}

function CreateIssueModal({
  open,
  onClose,
  onCreate,
}: CreateIssueModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [project, setProject] = useState("WorkSphere")
  const [priority, setPriority] =
    useState<IssuePriority>("Medium")
  const [assignee, setAssignee] =
    useState("Jivesh Sharma")
  const [dueDate, setDueDate] = useState("")

  if (!open) {
    return null
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!title.trim()) {
      return
    }

    onCreate({
      title: title.trim(),
      description: description.trim(),
      project,
      priority,
      assignee,
      dueDate,
    })

    setTitle("")
    setDescription("")
    setProject("WorkSphere")
    setPriority("Medium")
    setAssignee("Jivesh Sharma")
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
              Create issue
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Add a new issue to your workspace.
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
            {/* Title */}
            <div>
              <label
                htmlFor="issue-title"
                className="mb-1.5 block text-xs font-medium"
              >
                Title
              </label>

              <input
                id="issue-title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Describe the issue..."
                required
                autoFocus
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground/30"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="issue-description"
                className="mb-1.5 block text-xs font-medium"
              >
                Description
              </label>

              <textarea
                id="issue-description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Add more details..."
                rows={4}
                className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground focus:border-foreground/30"
              />
            </div>

            {/* Project + Priority */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="issue-project"
                  className="mb-1.5 block text-xs font-medium"
                >
                  Project
                </label>

                <select
                  id="issue-project"
                  value={project}
                  onChange={(event) =>
                    setProject(event.target.value)
                  }
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-foreground/30"
                >
                  {initialProjects.map((project) => (
  <option
    key={project.id}
    value={project.name}
  >
    {project.name}
  </option>
))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="issue-priority"
                  className="mb-1.5 block text-xs font-medium"
                >
                  Priority
                </label>

                <select
                  id="issue-priority"
                  value={priority}
                  onChange={(event) =>
                    setPriority(
                      event.target.value as IssuePriority,
                    )
                  }
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-foreground/30"
                >
                  <option value="Critical">
                    Critical
                  </option>

                  <option value="High">
                    High
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="Low">
                    Low
                  </option>
                </select>
              </div>
            </div>

            {/* Assignee + Due date */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="issue-assignee"
                  className="mb-1.5 block text-xs font-medium"
                >
                  Assignee
                </label>

                <select
                  id="issue-assignee"
                  value={assignee}
                  onChange={(event) =>
                    setAssignee(event.target.value)
                  }
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-foreground/30"
                >
                  <option value="Jivesh Sharma">
                    Jivesh Sharma
                  </option>

                  <option value="Raman">
                    Raman
                  </option>

                  <option value="Monika">
                    Monika
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="issue-due-date"
                  className="mb-1.5 block text-xs font-medium"
                >
                  Due date
                </label>

                <input
                  id="issue-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(event) =>
                    setDueDate(event.target.value)
                  }
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-foreground/30"
                />
              </div>
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
              Create issue
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateIssueModal