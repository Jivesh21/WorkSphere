import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react"
import { Check, ChevronDown, Search, UserRound, UserRoundX } from "lucide-react"

import type { MemberOption } from "../types"

interface AssigneeSelectorProps {
  inputId?: string
  members: MemberOption[]
  value: number | null
  selectedName: string | null
  onChange: (member: MemberOption | null) => void
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()
}

function AssigneeSelector({ inputId: providedInputId, members, value, selectedName, onChange }: AssigneeSelectorProps) {
  const id = useId()
  const inputId = providedInputId ?? `${id}-input`
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return members.filter((member) => !normalized || member.name.toLowerCase().includes(normalized))
  }, [members, query])
  const activeName = selectedName ?? members.find((member) => member.id === value)?.name ?? (value === null ? "Unassigned" : "Assigned member unavailable")
  const optionCount = filtered.length + 1

  function choose(member: MemberOption | null) {
    onChange(member)
    setOpen(false)
    setQuery("")
    setActiveIndex(0)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setOpen(true)
      setActiveIndex((index) => (index + 1) % optionCount)
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setOpen(true)
      setActiveIndex((index) => (index - 1 + optionCount) % optionCount)
    } else if (event.key === "Enter" && open) {
      event.preventDefault()
      if (activeIndex === 0) choose(null)
      else if (filtered[activeIndex - 1]) choose(filtered[activeIndex - 1])
    } else if (event.key === "Escape" && open) {
      event.preventDefault()
      setOpen(false)
      setQuery("")
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          ref={inputRef}
          id={inputId}
          role="combobox"
          aria-label="Search and select an assignee"
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
          aria-autocomplete="list"
          aria-activedescendant={open ? `${id}-option-${activeIndex}` : undefined}
          value={open ? query : activeName}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onChange={(event) => { setQuery(event.target.value); setActiveIndex(0); setOpen(true) }}
          onKeyDown={handleKeyDown}
          onBlur={(event) => {
            if (!event.currentTarget.parentElement?.parentElement?.contains(event.relatedTarget as Node | null)) {
              setOpen(false)
              setQuery("")
            }
          }}
          placeholder="Search available members"
          className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-8 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
        />
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      </div>

      {open && (
        <ul id={`${id}-listbox`} role="listbox" aria-label="Available assignees" className="absolute left-0 right-0 top-10 z-30 max-h-52 overflow-y-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg">
          <li>
            <div id={`${id}-option-0`} role="option" aria-selected={value === null} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(null)} className={`flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-left text-xs outline-none ${activeIndex === 0 ? "bg-accent text-accent-foreground" : "hover:bg-muted"}`}>
              <UserRoundX className="size-4 text-muted-foreground" aria-hidden="true" />
              <span className="flex-1">Unassigned</span>
              {value === null && <Check className="size-3.5 text-primary" aria-hidden="true" />}
            </div>
          </li>
          {filtered.map((member, index) => (
            <li key={member.id}>
              <div id={`${id}-option-${index + 1}`} role="option" aria-selected={value === member.id} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(member)} className={`flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-left text-xs outline-none ${activeIndex === index + 1 ? "bg-accent text-accent-foreground" : "hover:bg-muted"}`}>
                <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-semibold text-primary">{initials(member.name) || <UserRound className="size-3" />}</span>
                <span className="min-w-0 flex-1 truncate">{member.name}</span>
                {value === member.id && <Check className="size-3.5 text-primary" aria-hidden="true" />}
              </div>
            </li>
          ))}
          {filtered.length === 0 && <li className="px-2 py-2 text-xs text-muted-foreground">No available members match.</li>}
        </ul>
      )}
    </div>
  )
}

export default AssigneeSelector
