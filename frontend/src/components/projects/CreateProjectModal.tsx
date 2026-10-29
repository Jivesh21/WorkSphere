import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react"
import { Check, ChevronDown, X } from "lucide-react"
import * as m from "motion/react-m"
import { AnimatePresence } from "motion/react"

import {
  projectAccentOptions,
  projectIconOptions,
  type Project,
  type ProjectAccent,
  type ProjectHealth,
  type ProjectIconId,
  type ProjectStatus,
} from "@/constants/projects"
import { dialogOverlay, dialogPanel } from "@/lib/motion"

interface CreateProjectModalProps {
  open: boolean
  onClose: () => void
  onCreate: (project: Project) => string | undefined
  onUpdate?: (project: Project) => string | undefined
  initialProject?: Project | null
}

function suggestedCode(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length > 1) return words.map((word) => word[0]).join("").slice(0, 4).toUpperCase()
  return (words[0] ?? "").slice(0, 4).toUpperCase()
}

const inputClassName = "h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground hover:border-ring/60 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20"
const labelClassName = "mb-1.5 block text-xs font-medium text-foreground"

function CreateProjectModal({ open, onClose, onCreate, onUpdate, initialProject = null }: CreateProjectModalProps) {
  const nameInputRef = useRef<HTMLInputElement>(null)
  const iconPickerTriggerRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const dialogTitleId = useId()
  const dialogDescriptionId = useId()
  const iconPickerId = useId()
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [codeManuallyEdited, setCodeManuallyEdited] = useState(false)
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<ProjectStatus>("Planning")
  const [health, setHealth] = useState<ProjectHealth | "">("")
  const [dueDate, setDueDate] = useState("")
  const [iconId, setIconId] = useState<ProjectIconId>("folder")
  const [accentId, setAccentId] = useState<ProjectAccent>("violet")
  const [iconPickerOpen, setIconPickerOpen] = useState(false)
  const iconPickerOpenRef = useRef(iconPickerOpen)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  iconPickerOpenRef.current = iconPickerOpen

  const resetFields = useCallback(() => {
    setName("")
    setCode("")
    setCodeManuallyEdited(false)
    setDescription("")
    setStatus("Planning")
    setHealth("")
    setDueDate("")
    setIconId("folder")
    setAccentId("violet")
    setIconPickerOpen(false)
    setError("")
    setSubmitting(false)
  }, [])

  const closeDialog = useCallback(() => {
    resetFields()
    onClose()
  }, [onClose, resetFields])

  useEffect(() => {
    if (!open) return
    setName(initialProject?.name ?? "")
    setCode(initialProject?.code ?? "")
    setCodeManuallyEdited(Boolean(initialProject))
    setDescription(initialProject?.description ?? "")
    setStatus(initialProject?.status ?? "Planning")
    setHealth(initialProject?.health ?? "")
    setDueDate(initialProject?.dueDate ?? "")
    setIconId(initialProject?.icon ?? "folder")
    setAccentId(initialProject?.accent ?? "violet")
    setError("")
    setSubmitting(false)
    setIconPickerOpen(false)
  }, [open, initialProject])

  useEffect(() => {
    if (!open) return
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    nameInputRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return
      if (iconPickerOpenRef.current) {
        setIconPickerOpen(false)
        iconPickerTriggerRef.current?.focus()
      }
      else closeDialog()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      previousFocusRef.current?.focus()
    }
  }, [open, closeDialog])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return

    const trimmedName = name.trim()
    const normalizedCode = code.trim().toUpperCase()
    if (!trimmedName) {
      setError("Enter a project name.")
      nameInputRef.current?.focus()
      return
    }
    if (!/^[A-Z0-9][A-Z0-9-]{1,7}$/.test(normalizedCode)) {
      setError("Project key must be 2–8 characters using letters, numbers, or hyphens.")
      return
    }

    if (initialProject && !onUpdate) {
      setError("Project editing is unavailable.")
      return
    }

    const project: Project = {
      ...(initialProject ?? {}),
      id: initialProject?.id ?? Date.now(),
      name: trimmedName,
      code: normalizedCode,
      description: description.trim(),
      status,
      icon: iconId,
      accent: accentId,
      ...(health ? { health } : {}),
      ...(dueDate ? { dueDate } : {}),
    }

    setSubmitting(true)
    const saveError = initialProject ? onUpdate?.(project) : onCreate(project)
    if (saveError) {
      setError(saveError)
      setSubmitting(false)
      return
    }
    resetFields()
  }

  const selectedIcon = projectIconOptions.find((option) => option.id === iconId) ?? projectIconOptions[0]
  const selectedAccent = projectAccentOptions.find((option) => option.id === accentId) ?? projectAccentOptions[0]
  const PreviewIcon = selectedIcon.Icon

  return (
    <AnimatePresence>
      {open && (
        <m.div
          {...dialogOverlay}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-[2px] sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDialog()
          }}
        >
          <m.section
            {...dialogPanel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            aria-describedby={dialogDescriptionId}
            onKeyDown={(event) => {
              if (event.key !== "Tab") return
              const focusable = event.currentTarget.querySelectorAll<HTMLElement>(
                'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
              )
              const first = focusable.item(0)
              const last = focusable.item(focusable.length - 1)
              if (event.shiftKey && document.activeElement === first) {
                event.preventDefault()
                last?.focus()
              } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault()
                first?.focus()
              }
            }}
            className="my-auto flex max-h-[min(720px,calc(100dvh-1.5rem))] w-full max-w-[600px] flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-2xl sm:max-h-[min(720px,calc(100dvh-2.5rem))]"
          >
            <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-4 py-3.5 sm:px-5">
              <div className="min-w-0">
                <h2 id={dialogTitleId} className="text-base font-semibold tracking-tight">{initialProject ? "Edit project" : "Create project"}</h2>
                <p id={dialogDescriptionId} className="mt-0.5 text-xs leading-5 text-muted-foreground">{initialProject ? "Update this project’s details." : "Create a project to organize related work."}</p>
              </div>
              <button
                type="button"
                onClick={closeDialog}
                aria-label={`Close ${initialProject ? "edit" : "create"} project dialog`}
                className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </header>

            <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-3.5 sm:px-5">
                <section aria-labelledby={`${dialogTitleId}-identity`} className="space-y-3.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-border pb-2">
                    <h3 id={`${dialogTitleId}-identity`} className="text-sm font-semibold tracking-tight">Project identity</h3>
                    <p className="text-[11px] text-muted-foreground">Name, key and visual identifier</p>
                  </div>

                  <div>
                    <label htmlFor="project-name" className={labelClassName}>Project name <span className="text-destructive" aria-hidden="true">*</span></label>
                    <div className="flex items-center gap-2">
                      <div className="relative shrink-0">
                        <button
                          ref={iconPickerTriggerRef}
                          type="button"
                          aria-label={`Choose project icon. Current icon: ${selectedIcon.label}`}
                          aria-expanded={iconPickerOpen}
                          aria-controls={iconPickerId}
                          onClick={() => setIconPickerOpen((value) => !value)}
                          className={`flex size-8 items-center justify-center rounded-md border border-border ${selectedAccent.iconBackground} ${selectedAccent.icon} outline-none transition-colors hover:border-ring/60 focus-visible:ring-2 focus-visible:ring-ring`}
                        >
                          <PreviewIcon className="size-4" aria-hidden="true" />
                          <ChevronDown className="absolute -bottom-1 -right-1 size-3 rounded-full border border-card bg-card p-0.5 text-muted-foreground" aria-hidden="true" />
                        </button>
                        {iconPickerOpen && (
                          <div id={iconPickerId} aria-label="Project icon choices" className="absolute left-0 top-full z-20 mt-2 grid w-[min(248px,calc(100vw-3rem))] grid-cols-4 gap-1.5 rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-lg">
                            {projectIconOptions.map(({ id, label, Icon }) => (
                              <button
                                key={id}
                                type="button"
                                aria-label={label}
                                aria-pressed={iconId === id}
                                onClick={() => { setIconId(id); setIconPickerOpen(false); iconPickerTriggerRef.current?.focus() }}
                                className={`flex size-9 items-center justify-center rounded-md outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring ${iconId === id ? "bg-muted text-primary ring-1 ring-primary/35" : "text-muted-foreground"}`}
                              >
                                <Icon className="size-4" aria-hidden="true" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <input
                        ref={nameInputRef}
                        id="project-name"
                        value={name}
                        onChange={(event) => {
                          const nextName = event.target.value
                          setName(nextName)
                          if (!codeManuallyEdited) setCode(suggestedCode(nextName))
                          setError("")
                        }}
                        maxLength={100}
                        autoComplete="off"
                        required
                        aria-required="true"
                        aria-invalid={error === "Enter a project name."}
                        aria-describedby={error === "Enter a project name." ? "project-name-error" : undefined}
                        className={inputClassName}
                        placeholder="e.g. Mobile application"
                      />
                    </div>
                    {error === "Enter a project name." && <p id="project-name-error" className="mt-1 text-xs text-destructive">{error}</p>}
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="min-w-0 flex-1">
                      <label htmlFor="project-code" className={labelClassName}>Project key <span className="text-destructive" aria-hidden="true">*</span></label>
                      <input
                        id="project-code"
                        value={code}
                        onChange={(event) => { setCode(event.target.value.toUpperCase()); setCodeManuallyEdited(true); setError("") }}
                        maxLength={8}
                        autoCapitalize="characters"
                        autoComplete="off"
                        required
                        aria-required="true"
                        aria-invalid={Boolean(error && error !== "Enter a project name.")}
                        aria-describedby={error && error !== "Enter a project name." ? "project-code-error" : "project-code-help"}
                        className={`${inputClassName} font-mono uppercase`}
                        placeholder="e.g. MOB"
                      />
                      {error && error !== "Enter a project name." && <p id="project-code-error" role="alert" className="mt-1 text-xs text-destructive">{error}</p>}
                      <p id="project-code-help" className="mt-1 text-[10px] text-muted-foreground">2 to 8 letters, numbers, or hyphens. Suggested from the name.</p>
                    </div>

                    <div className="shrink-0">
                      <p className="mb-1.5 text-xs font-medium text-foreground">Accent</p>
                      <div role="group" aria-label="Project accent color" className="flex h-9 items-center gap-1.5">
                        {projectAccentOptions.map((accent) => (
                          <button
                            key={accent.id}
                            type="button"
                            aria-label={`${accent.label} accent`}
                            aria-pressed={accentId === accent.id}
                            onClick={() => setAccentId(accent.id)}
                            className={`flex size-7 items-center justify-center rounded-full outline-none transition-[box-shadow,transform] hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card ${accentId === accent.id ? "ring-2 ring-foreground/70 ring-offset-2 ring-offset-card" : ""}`}
                          >
                            <span className={`size-4 rounded-full ${accent.swatch}`} aria-hidden="true" />
                            {accentId === accent.id && <Check className="sr-only" aria-hidden="true" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex min-w-0 items-center gap-3 rounded-md border border-border bg-background px-3 py-2" aria-live="polite">
                    <span className={`flex size-8 shrink-0 items-center justify-center rounded-md ${selectedAccent.iconBackground} ${selectedAccent.icon}`}>
                      <PreviewIcon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-medium">{name.trim() || "Untitled project"}</span>
                      <span className="mt-0.5 block truncate font-mono text-[10px] tracking-wide text-muted-foreground">{code.trim().toUpperCase() || "PROJECT KEY"}</span>
                    </span>
                    <span className={`size-2 shrink-0 rounded-full ${selectedAccent.swatch}`} aria-label={`${selectedAccent.label} accent`} />
                  </div>
                </section>

                <section aria-labelledby={`${dialogTitleId}-details`} className="space-y-3.5 border-t border-border pt-3.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-border pb-2">
                    <h3 id={`${dialogTitleId}-details`} className="text-sm font-semibold tracking-tight">Details</h3>
                    <p className="text-[11px] text-muted-foreground">Optional context and planning</p>
                  </div>
                  <div>
                    <label htmlFor="project-description" className={labelClassName}>Description <span className="font-normal text-muted-foreground">(optional)</span></label>
                    <textarea
                      id="project-description"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      maxLength={500}
                      rows={2}
                      className="min-h-[68px] max-h-28 w-full resize-y rounded-md border border-input bg-background px-2.5 py-2 text-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground hover:border-ring/60 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                      placeholder="What is this project working toward?"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label htmlFor="project-status" className={labelClassName}>Status</label>
                      <select id="project-status" value={status} onChange={(event) => setStatus(event.target.value as ProjectStatus)} className={inputClassName}>
                        <option value="Planning">Planning</option>
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="project-health" className={labelClassName}>Health <span className="font-normal text-muted-foreground">(optional)</span></label>
                      <select id="project-health" value={health} onChange={(event) => setHealth(event.target.value as ProjectHealth | "")} className={inputClassName}>
                        <option value="">Not set</option>
                        <option value="On track">On track</option>
                        <option value="At risk">At risk</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="project-due-date" className={labelClassName}>Due date <span className="font-normal text-muted-foreground">(optional)</span></label>
                      <input id="project-due-date" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className={`${inputClassName} text-muted-foreground`} />
                  </div>
                </section>
              </div>

              <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-border bg-muted/20 px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
                <button type="button" onClick={closeDialog} className="min-h-9 rounded-md border border-border bg-background px-4 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">Cancel</button>
                <button type="submit" disabled={submitting} className="min-h-9 rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-wait disabled:opacity-60">{submitting ? (initialProject ? "Saving..." : "Creating...") : (initialProject ? "Save changes" : "Create project")}</button>
              </footer>
            </form>
          </m.section>
        </m.div>
      )}
    </AnimatePresence>
  )
}

export default CreateProjectModal
