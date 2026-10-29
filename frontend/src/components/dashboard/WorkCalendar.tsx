import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"

import useTasks from "@/hooks/useTasks"
import type { Task } from "@/pages/MyWorkPage/types"
import { Link } from "react-router-dom"

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function localDate(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  return year && month && day ? new Date(year, month - 1, day) : null
}

function WorkCalendar() {
  const { tasks } = useTasks()
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(() => dateKey(new Date()))
  const monthLabel = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(month)
  const todayKey = dateKey(new Date())
  const days = useMemo(() => {
    const firstDayOffset = new Date(month.getFullYear(), month.getMonth(), 1).getDay()
    const start = new Date(month.getFullYear(), month.getMonth(), 1 - firstDayOffset)
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    const cellCount = firstDayOffset + daysInMonth > 35 ? 42 : 35
    return Array.from({ length: cellCount }, (_, index) => {
      const date = new Date(start)
      date.setDate(start.getDate() + index)
      return date
    })
  }, [month])
  const selectedTasks = tasks.filter((task) => task.startDate === selectedDate || task.dueDate === selectedDate)
  const tasksByDate = new Map<string, Task[]>()
  for (const task of tasks) {
    for (const value of [task.startDate, task.dueDate]) {
      if (!value) continue
      const dateTasks = tasksByDate.get(value) ?? []
      if (!dateTasks.some((item) => item.id === task.id)) dateTasks.push(task)
      tasksByDate.set(value, dateTasks)
    }
  }

  function shiftMonth(amount: number) {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1))
  }

  return (
    <section aria-labelledby="calendar-title" className="min-w-0 overflow-hidden rounded-md border border-border bg-card">
      <header className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <CalendarDays className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
          <h2 id="calendar-title" className="truncate text-xs leading-none font-semibold tracking-tight">{monthLabel}</h2>
        </div>
        <div className="flex items-center gap-0.5">
          <button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month" className="inline-flex size-6 items-center justify-center rounded text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"><ChevronLeft className="size-3" /></button>
          <button type="button" onClick={() => { const now = new Date(); setMonth(new Date(now.getFullYear(), now.getMonth(), 1)); setSelectedDate(todayKey) }} className="rounded px-1.5 py-1 text-[10px] font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none">Today</button>
          <button type="button" onClick={() => shiftMonth(1)} aria-label="Next month" className="inline-flex size-6 items-center justify-center rounded text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"><ChevronRight className="size-3" /></button>
        </div>
      </header>
      <div className="px-2.5 pt-1">
        <div className="grid grid-cols-7 text-center text-[10px] leading-none font-medium uppercase tracking-wide text-muted-foreground" aria-hidden="true">
          { ["S", "M", "T", "W", "T", "F", "S"].map((day, index) => <span key={`${day}-${index}`} className="py-0.5">{day}</span>) }
        </div>
        <div role="group" aria-label={monthLabel} className="grid grid-cols-7 gap-y-0">
          {days.map((date) => {
            const key = dateKey(date)
            const dateTasks = tasksByDate.get(key) ?? []
            const currentMonth = date.getMonth() === month.getMonth()
            const selected = key === selectedDate
            const hasDueDate = dateTasks.some((task) => task.dueDate === key)
            const hasStartDate = dateTasks.some((task) => task.startDate === key)
            return (
              <button key={key} type="button" aria-label={`${new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(date)}${dateTasks.length ? `, ${dateTasks.length} tasks` : ""}`} aria-current={key === todayKey ? "date" : undefined} aria-pressed={selected} onClick={() => { setSelectedDate(key); if (!currentMonth) setMonth(new Date(date.getFullYear(), date.getMonth(), 1)) }} className={`relative mx-auto flex size-[26px] flex-col items-center justify-center rounded-full text-[10px] leading-none outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${selected ? "bg-primary font-semibold text-primary-foreground shadow-sm" : key === todayKey ? "border border-primary/55 bg-primary/5 font-semibold text-foreground" : currentMonth ? "text-foreground hover:bg-muted" : "text-muted-foreground/45 hover:bg-muted"}`}>
                <span>{date.getDate()}</span>
                {dateTasks.length > 0 && <span aria-hidden="true" className="absolute bottom-0.5 flex items-center gap-0.5">
                  {hasStartDate && <span className={`size-0.5 rounded-full ${selected ? "bg-primary-foreground/70" : "bg-chart-2"}`} />}
                  {hasDueDate && <span className={`size-0.5 rounded-full ${selected ? "bg-primary-foreground" : "bg-primary"}`} />}
                </span>}
              </button>
            )
          })}
        </div>
      </div>
      <div className="mt-1 border-t border-border px-3 py-2">
        {selectedTasks.length ? (
          <Link to="/work" className="block truncate text-[10px] text-muted-foreground outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring">
            {new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(localDate(selectedDate) ?? new Date())}: {selectedTasks.length} task{selectedTasks.length === 1 ? "" : "s"}
          </Link>
        ) : <p className="truncate text-[10px] leading-none text-muted-foreground">{new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(localDate(selectedDate) ?? new Date())} · No task dates</p>}
      </div>
    </section>
  )
}

export default WorkCalendar
