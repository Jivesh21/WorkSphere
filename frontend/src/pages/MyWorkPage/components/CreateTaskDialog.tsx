import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react"
import { LoaderCircle, Mic, MicOff, Sparkles, X } from "lucide-react"
import * as m from "motion/react-m"

import { dialogOverlay, dialogPanel } from "@/lib/motion"
import { getSpeechRecognitionConstructor, type SpeechRecognitionLike } from "@/lib/speechRecognition"
import useTasks from "@/hooks/useTasks"
import type { MemberOption, ProjectOption, Task, TaskFormValues, TaskPriority, TaskStatus } from "../types"
import { taskPriorityLabels, taskStatusLabels } from "../types"
import AssigneeSelector from "./AssigneeSelector"

interface TaskFormDialogProps {
  onClose: () => void
  onSave: (values: TaskFormValues) => void
  initialTask?: Task
  projects?: ProjectOption[]
  members?: MemberOption[]
}

const priorities: TaskPriority[] = ["HIGH", "MEDIUM", "LOW"]
const statuses: TaskStatus[] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]

interface VoiceDraft {
  title: string
  priority?: TaskPriority
  dueDate?: string
  assignee?: MemberOption
  project?: ProjectOption
  notes: string[]
}

function TaskFormDialog({
  onClose,
  onSave,
  initialTask,
  projects = [],
  members = [],
}: TaskFormDialogProps) {
  const titleInputRef = useRef<HTMLInputElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  const editing = Boolean(initialTask)
  const availableProjects = initialTask?.projectId && !projects.some((project) => project.id === initialTask.projectId)
    ? [{ id: initialTask.projectId, name: initialTask.projectName ?? `Project #${initialTask.projectId}` }, ...projects]
    : projects
  const availableMembers = members
  const { tasks: sessionTasks } = useTasks()
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const [values, setValues] = useState<TaskFormValues>(() => initialTask ? {
    title: initialTask.title,
    description: initialTask.description,
    status: initialTask.status,
    priority: initialTask.priority,
    startDate: initialTask.startDate,
    dueDate: initialTask.dueDate,
    projectId: initialTask.projectId,
    projectName: initialTask.projectName,
    assignedUserId: initialTask.assignedUserId,
    assignedUserName: initialTask.assignedUserName,
  } : {
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    startDate: "",
    dueDate: "",
    projectId: null,
    projectName: null,
    assignedUserId: null,
    assignedUserName: null,
  })
  const [errors, setErrors] = useState<{ title?: string; dates?: string }>({})
  const [voiceTranscript, setVoiceTranscript] = useState("")
  const [voiceError, setVoiceError] = useState("")
  const [voiceStatus, setVoiceStatus] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [voiceDraft, setVoiceDraft] = useState<VoiceDraft | null>(null)
  const [voiceDraftApplied, setVoiceDraftApplied] = useState(false)
  const recognitionConstructor = getSpeechRecognitionConstructor()
  const assigneeIsAvailable = values.assignedUserId !== null && availableMembers.some((member) => member.id === values.assignedUserId)
  const selectedAssigneeTasks = assigneeIsAvailable
    ? sessionTasks.filter((task) => task.assignedUserId === values.assignedUserId)
    : []
  const selectedAssigneeOpen = selectedAssigneeTasks.filter((task) => task.status !== "DONE").length
  const today = getTodayDate()
  const selectedAssigneeOverdue = selectedAssigneeTasks.filter((task) => task.status !== "DONE" && task.dueDate && task.dueDate < today).length

  useEffect(() => {
    titleInputRef.current?.focus()
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      recognitionRef.current?.abort()
      recognitionRef.current = null
    }
  }, [onClose])

  function startVoiceCapture() {
    setVoiceError("")
    setVoiceStatus("")
    setVoiceDraft(null)
    setVoiceDraftApplied(false)
    if (!recognitionConstructor) {
      setVoiceError("Speech recognition is not supported in this browser. You can still enter the task details manually.")
      return
    }

    try {
      const recognition = new recognitionConstructor()
      recognitionRef.current = recognition
      recognition.lang = navigator.language || "en-US"
      recognition.continuous = false
      recognition.interimResults = false
      recognition.onstart = () => {
        setIsListening(true)
        setVoiceStatus("Listening. Speak your task details, then pause.")
      }
      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript?.trim() ?? ""
        if (!transcript) {
          setVoiceError("No speech was recognized. Try again or enter the task manually.")
          setVoiceStatus("")
          return
        }
        setVoiceTranscript(transcript)
        setVoiceStatus("Transcript ready to review.")
      }
      recognition.onerror = (event) => {
        const messages: Record<string, string> = {
          "not-allowed": "Microphone permission was denied. Allow microphone access in your browser or enter the task manually.",
          "service-not-allowed": "Speech recognition is blocked by the browser or device policy.",
          "no-speech": "No speech was detected. Try again in a quieter place.",
          "audio-capture": "No microphone is available to the browser.",
          network: "The browser speech service could not be reached. Try again later.",
          aborted: "Speech recognition was stopped.",
        }
        setVoiceError(messages[event.error] ?? "Speech recognition failed. Try again or enter the task manually.")
        setVoiceStatus("")
      }
      recognition.onend = () => setIsListening(false)
      recognition.start()
      setIsListening(true)
      setVoiceStatus("Starting microphone…")
    } catch {
      setIsListening(false)
      setVoiceError("The microphone could not be started. Check browser permission and try again.")
    }
  }

  function stopVoiceCapture() {
    recognitionRef.current?.stop()
    setIsListening(false)
    setVoiceStatus("Listening stopped. Review the transcript before continuing.")
  }

  function reviewVoiceTranscript() {
    const draft = parseVoiceDraft(voiceTranscript, projects, availableMembers)
    setVoiceDraft(draft)
    setVoiceDraftApplied(false)
    setVoiceStatus("Draft suggestion ready. Review its fields before creating the task.")
  }

  function applyVoiceDraft() {
    if (!voiceDraft) return
    setValues((current) => ({
      ...current,
      title: voiceDraft.title,
      ...(voiceDraft.priority ? { priority: voiceDraft.priority } : {}),
      ...(voiceDraft.dueDate ? { dueDate: voiceDraft.dueDate } : {}),
      ...(voiceDraft.assignee ? { assignedUserId: voiceDraft.assignee.id, assignedUserName: voiceDraft.assignee.name } : {}),
      ...(voiceDraft.project ? { projectId: voiceDraft.project.id, projectName: voiceDraft.project.name } : {}),
    }))
    setErrors({})
    setVoiceDraftApplied(true)
    titleInputRef.current?.focus()
  }

  function updateVoiceTranscript(value: string) {
    setVoiceTranscript(value)
    setVoiceDraft(null)
    setVoiceDraftApplied(false)
    setVoiceError("")
    setVoiceStatus("")
  }

  function setField<K extends keyof TaskFormValues>(field: K, value: TaskFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors({})
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: typeof errors = {}
    if (!values.title.trim()) nextErrors.title = "Enter a task title."
    if (values.startDate && values.dueDate && values.dueDate < values.startDate) {
      nextErrors.dates = "The due date must be on or after the start date."
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.title) titleInputRef.current?.focus()
      return
    }

    const project = availableProjects.find((option) => option.id === values.projectId)
    const member = availableMembers.find((option) => option.id === values.assignedUserId)
    onSave({
      ...values,
      title: values.title.trim(),
      description: values.description.trim(),
      projectName: project?.name ?? (values.projectId === initialTask?.projectId ? initialTask.projectName : null),
      assignedUserName: member?.name ?? (values.assignedUserId === initialTask?.assignedUserId ? initialTask.assignedUserName : null),
    })
  }

  return (
    <m.div
      {...dialogOverlay}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <m.section
        {...dialogPanel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
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
        className="my-auto flex max-h-[min(780px,calc(100dvh-1.5rem))] w-full max-w-[620px] flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-2xl sm:max-h-[min(780px,calc(100dvh-2.5rem))]"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-4 py-3.5 sm:px-5">
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-semibold tracking-tight">
              {editing ? "Edit task" : "Create task"}
            </h2>
            <p id={descriptionId} className="mt-1 text-xs text-muted-foreground">
              Changes stay in this app session. Start dates are not yet supported by the task API.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close task form" className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
            <X className="size-4" aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
            {!editing && (
              <section aria-labelledby="voice-task-heading" className={`rounded-lg border p-3 transition-colors motion-reduce:transition-none ${voiceError ? "border-destructive/30 bg-destructive/[0.03]" : isListening ? "border-primary/25 bg-primary/[0.035]" : "border-border bg-muted/15"}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <VoiceVisualizer isListening={isListening} hasError={Boolean(voiceError)} />
                    <div className="min-w-0">
                    <h3 id="voice-task-heading" className="text-xs font-semibold">Voice to task</h3>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">Browser speech recognition · client-side draft suggestions only</p>
                    </div>
                  </div>
                  <button type="button" onClick={isListening ? stopVoiceCapture : startVoiceCapture} aria-pressed={isListening} className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${voiceError ? "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15" : "border-primary/25 bg-primary/10 text-primary hover:bg-primary/15"}`}>
                    {isListening ? <MicOff className="size-3.5" aria-hidden="true" /> : <Mic className="size-3.5" aria-hidden="true" />}
                    {isListening ? "Stop listening" : "Speak task"}
                  </button>
                </div>

                <p role="status" aria-live="polite" className={`mt-2 flex items-center gap-1.5 text-[10px] font-medium ${voiceError ? "text-destructive" : isListening ? "text-primary" : "text-muted-foreground"}`}>
                  {isListening && <LoaderCircle className="size-3 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
                  {voiceError ? "Voice capture needs attention" : isListening ? "Listening · speak your task, then pause" : "Ready when you are · speak a task or enter it below"}
                </p>

                {!recognitionConstructor && <p className="mt-2 text-[10px] text-muted-foreground">Speech recognition is not available in this browser. You can still create a task with the form below.</p>}
                {voiceStatus && <p aria-live="polite" className="mt-1 text-[10px] text-muted-foreground">{voiceStatus}</p>}
                {voiceError && <p role="alert" className="mt-2 text-[11px] text-destructive">{voiceError}</p>}

                {(voiceTranscript || isListening) && (
                  <div className="mt-2.5">
                    <label htmlFor="voice-task-transcript" className="mb-1 block text-[10px] font-medium">Recognized transcript <span className="font-normal text-muted-foreground">(editable)</span></label>
                    <textarea id="voice-task-transcript" value={voiceTranscript} onChange={(event) => updateVoiceTranscript(event.target.value)} rows={2} maxLength={1000} placeholder="Your recognized words will appear here" className="w-full resize-y rounded-md border border-input bg-background px-2.5 py-2 text-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30" />
                    <button type="button" disabled={!voiceTranscript.trim() || isListening} onClick={reviewVoiceTranscript} className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-[11px] font-medium outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                      <Sparkles className="size-3.5 text-primary" aria-hidden="true" />Review draft suggestion
                    </button>
                  </div>
                )}

                {voiceDraft && (
                  <div className="mt-3 rounded-md border border-primary/20 bg-primary/[0.04] p-2.5">
                    <p className="text-[10px] font-semibold text-primary">Draft suggestion <span className="font-normal text-muted-foreground">· simple browser-side extraction, not AI</span></p>
                    <dl className="mt-2 grid gap-x-4 gap-y-1.5 text-[11px] sm:grid-cols-2">
                      <DraftValue label="Title" value={voiceDraft.title} />
                      {voiceDraft.priority && <DraftValue label="Priority" value={taskPriorityLabels[voiceDraft.priority]} />}
                      {voiceDraft.dueDate && <DraftValue label="Due date" value={formatDate(voiceDraft.dueDate)} />}
                      {voiceDraft.assignee && <DraftValue label="Assignee" value={voiceDraft.assignee.name} />}
                      {voiceDraft.project && <DraftValue label="Project" value={voiceDraft.project.name} />}
                    </dl>
                    {voiceDraft.notes.length > 0 && <ul className="mt-2 list-inside list-disc space-y-0.5 text-[10px] text-muted-foreground">{voiceDraft.notes.map((note) => <li key={note}>{note}</li>)}</ul>}
                    <p className="mt-2 text-[10px] text-muted-foreground">The transcript stays available above. You can edit every task field in the form before creating it.</p>
                    <button type="button" onClick={applyVoiceDraft} className="mt-2 inline-flex h-8 items-center rounded-md bg-primary px-2.5 text-[11px] font-medium text-primary-foreground outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring">Use draft in form</button>
                    {voiceDraftApplied && <p role="status" className="mt-2 text-[10px] font-medium text-primary">Draft fields copied into the form. Review them and choose Create task to confirm.</p>}
                  </div>
                )}
              </section>
            )}

            <div>
              <label htmlFor="task-title" className="mb-1.5 block text-xs font-medium">
                Task title <span className="text-destructive" aria-hidden="true">*</span>
              </label>
              <input
                ref={titleInputRef}
                id="task-title"
                value={values.title}
                onChange={(event) => setField("title", event.target.value)}
                maxLength={160}
                aria-required="true"
                aria-invalid={Boolean(errors.title)}
                aria-describedby={errors.title ? "task-title-error" : undefined}
                placeholder="Describe the task"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 aria-invalid:border-destructive"
              />
              {errors.title && <p id="task-title-error" className="mt-1.5 text-xs text-destructive">{errors.title}</p>}
            </div>

            <div>
              <label htmlFor="task-description" className="mb-1.5 block text-xs font-medium">Description <span className="font-normal text-muted-foreground">(optional)</span></label>
              <textarea
                id="task-description"
                value={values.description}
                onChange={(event) => setField("description", event.target.value)}
                maxLength={2000}
                rows={3}
                placeholder="Add context or acceptance notes"
                className="w-full resize-y rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Status" htmlFor="task-status">
                <select id="task-status" value={values.status} onChange={(event) => setField("status", event.target.value as TaskStatus)} className={controlClass}>
                  {statuses.map((status) => <option key={status} value={status}>{taskStatusLabels[status]}</option>)}
                </select>
              </Field>
              <Field label="Priority" htmlFor="task-priority">
                <select id="task-priority" value={values.priority} onChange={(event) => setField("priority", event.target.value as TaskPriority)} className={controlClass}>
                  {priorities.map((priority) => <option key={priority} value={priority}>{taskPriorityLabels[priority]}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Start date" htmlFor="task-start-date" optional>
                <input id="task-start-date" type="date" value={values.startDate} max={values.dueDate || undefined} onChange={(event) => setField("startDate", event.target.value)} className={controlClass} />
              </Field>
              <Field label="Due date" htmlFor="task-due-date" optional>
                <input id="task-due-date" type="date" value={values.dueDate} min={values.startDate || undefined} onChange={(event) => setField("dueDate", event.target.value)} className={controlClass} />
              </Field>
            </div>
            {errors.dates && <p role="alert" className="text-xs text-destructive">{errors.dates}</p>}

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Project" htmlFor="task-project">
                <select
                  id="task-project"
                  value={values.projectId ?? ""}
                  disabled={availableProjects.length === 0}
                  onChange={(event) => setField("projectId", event.target.value ? Number(event.target.value) : null)}
                  className={controlClass}
                >
                  <option value="">{availableProjects.length ? "No project" : "No projects available"}</option>
                  {availableProjects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                </select>
                <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                  {projects.length ? "Choose from available projects." : "Project records are not connected yet; tasks can remain unlinked."}
                </p>
              </Field>
              <Field label="Assignee" htmlFor="task-assignee-input" optional>
                <AssigneeSelector
                  inputId="task-assignee-input"
                  members={availableMembers}
                  value={values.assignedUserId}
                  selectedName={values.assignedUserName}
                  onChange={(member) => setValues((current) => ({
                    ...current,
                    assignedUserId: member?.id ?? null,
                    assignedUserName: member?.name ?? null,
                  }))}
                />
                <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                  {availableMembers.length ? "Only members available to this account can be selected." : "No member directory is connected; choose Unassigned."}
                </p>
                {values.assignedUserId === null ? (
                  <p className="mt-1.5 rounded border border-border bg-muted/20 px-2.5 py-2 text-[10px] leading-relaxed text-muted-foreground">Select an available assignee to view workload from this session. Team-wide workload is unavailable.</p>
                ) : assigneeIsAvailable ? (
                  <div className="mt-1.5 rounded border border-border bg-muted/20 px-2.5 py-2">
                    <p className="text-[10px] font-medium">Session task workload for {values.assignedUserName}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{selectedAssigneeTasks.length} assigned · {selectedAssigneeOpen} open · {selectedAssigneeOverdue} overdue</p>
                    <p className="mt-1 text-[9px] text-muted-foreground">Counts use only tasks visible in this signed-in account's session.</p>
                  </div>
                ) : (
                  <p className="mt-1.5 rounded border border-dashed border-border px-2.5 py-2 text-[10px] leading-relaxed text-muted-foreground">This assignee is not in the available member directory. Their workload cannot be loaded.</p>
                )}
              </Field>
            </div>
          </div>

          <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-border bg-muted/20 px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
            <button type="button" onClick={onClose} className="min-h-9 rounded-md border border-border bg-background px-4 text-xs font-medium text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">Cancel</button>
            <button type="submit" className="min-h-9 rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring">
              {editing ? "Save changes" : "Create task"}
            </button>
          </footer>
        </form>
      </m.section>
    </m.div>
  )
}

function VoiceVisualizer({ isListening, hasError }: { isListening: boolean; hasError: boolean }) {
  const bars = [0, 1, 2, 3, 4]

  return (
    <div
      aria-hidden="true"
      className={`relative flex size-9 shrink-0 items-center justify-center rounded-full border ${hasError ? "border-destructive/30 bg-destructive/10 text-destructive" : isListening ? "border-primary/35 bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground"}`}
    >
      {isListening && <span className="absolute inset-0 rounded-full border border-primary/25 motion-safe:animate-ping motion-reduce:animate-none" />}
      <div className="relative flex h-4 items-center gap-[2px]">
        {bars.map((bar) => (
          <m.span
            key={bar}
            className={`w-[2px] rounded-full ${hasError ? "bg-destructive" : "bg-current"}`}
            animate={isListening ? { height: [5, 13, 7, 11, 5] } : { height: 5 }}
            transition={isListening ? {
              duration: 0.9,
              repeat: Infinity,
              ease: "easeInOut",
              delay: bar * 0.11,
            } : { duration: 0.18 }}
          />
        ))}
      </div>
    </div>
  )
}

function Field({ label, htmlFor, optional, children }: { label: string; htmlFor: string; optional?: boolean; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium">
        {label} {optional && <span className="font-normal text-muted-foreground">(optional)</span>}
      </label>
      {children}
    </div>
  )
}

function DraftValue({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><dt className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</dt><dd className="truncate font-medium">{value}</dd></div>
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return value
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(year, month - 1, day))
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function parseVoiceDraft(transcript: string, projects: ProjectOption[], members: MemberOption[]): VoiceDraft {
  let remainder = transcript.trim()
  const notes: string[] = []
  const draft: VoiceDraft = { title: "", notes }

  const priorityMatch = remainder.match(/\b(high|medium|low)[ -]priority\b|\bpriority(?:\s+is)?\s*[:,]?\s*(high|medium|low)\b/i)
  if (priorityMatch) {
    const priorityWord = (priorityMatch[1] ?? priorityMatch[2]).toUpperCase() as TaskPriority
    draft.priority = priorityWord
    remainder = remainder.replace(priorityMatch[0], " ")
  }

  const deadlineMatch = remainder.match(/\b(?:due|by|deadline)(?:\s+date)?\s+(?:on\s+)?(today|tomorrow|20\d{2}-\d{2}-\d{2})\b/i)
  if (deadlineMatch) {
    const rawDate = deadlineMatch[1].toLowerCase()
    if (rawDate === "today" || rawDate === "tomorrow") {
      const date = new Date()
      date.setHours(0, 0, 0, 0)
      if (rawDate === "tomorrow") date.setDate(date.getDate() + 1)
      draft.dueDate = dateKey(date)
      remainder = remainder.replace(deadlineMatch[0], " ")
    } else if (isValidDateKey(rawDate)) {
      draft.dueDate = rawDate
      remainder = remainder.replace(deadlineMatch[0], " ")
    } else {
      notes.push("The spoken date was not a valid calendar date; set the deadline manually.")
    }
  } else if (/\b(?:due|by|deadline)\b/i.test(remainder)) {
    notes.push("A deadline was mentioned but was not clear enough to extract; set it manually.")
  }

  let matchedMember: MemberOption | undefined
  let memberPhrase = ""
  for (const member of [...members].sort((a, b) => b.name.length - a.name.length)) {
    const escapedName = escapeRegExp(member.name)
    const expression = new RegExp(`\\b(?:assign(?:\\s+(?:it|this))?\\s+to|assignee\\s+is)\\s+${escapedName}\\b`, "i")
    const match = remainder.match(expression)
    if (match) {
      matchedMember = member
      memberPhrase = match[0]
      break
    }
  }
  if (matchedMember) {
    draft.assignee = matchedMember
    remainder = remainder.replace(memberPhrase, " ")
  } else if (/\b(?:assign|assignee)\b/i.test(remainder)) {
    notes.push("An assignee was mentioned but did not match an available member; choose an assignee manually.")
  }

  let matchedProject: ProjectOption | undefined
  let projectPhrase = ""
  for (const project of [...projects].sort((a, b) => b.name.length - a.name.length)) {
    const escapedName = escapeRegExp(project.name)
    const expression = new RegExp(`\\b(?:in|for)\\s+(?:the\\s+)?project\\s+${escapedName}\\b`, "i")
    const match = remainder.match(expression)
    if (match) {
      matchedProject = project
      projectPhrase = match[0]
      break
    }
  }
  if (matchedProject) {
    draft.project = matchedProject
    remainder = remainder.replace(projectPhrase, " ")
  } else if (/\bproject\b/i.test(remainder)) {
    notes.push("A project was mentioned but did not match an available project; choose one manually.")
  }

  remainder = remainder.replace(/^\s*(?:please\s+)?(?:create|add|make)\s+(?:a\s+)?task(?:\s+(?:to|for|titled|named))?\s*[:,\-]?\s*/i, "")
  const suggestedTitle = remainder.replace(/^[\s,;:.-]+|[\s,;:.-]+$/g, "").replace(/\s+/g, " ").trim()
  draft.title = suggestedTitle || transcript.trim()
  if (!suggestedTitle) notes.push("The transcript was kept as the title because a shorter title was not clear.")
  if (draft.title.length > 160) {
    draft.title = draft.title.slice(0, 160).trimEnd()
    notes.push("The title suggestion was shortened to fit the task title limit; the full transcript remains available above.")
  }
  if (!draft.priority && !draft.dueDate && !draft.assignee && !draft.project) {
    notes.push("No other fields were extracted; review the transcript and fill in fields manually.")
  }
  return draft
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function isValidDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return false
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

function getTodayDate() {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
}

const controlClass = "h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:bg-muted/50 disabled:text-muted-foreground"

export default TaskFormDialog
