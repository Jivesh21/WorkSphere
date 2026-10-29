import type { Task } from "../types"
import * as m from "motion/react-m"
import { staggerContainer, staggerItem } from "@/lib/motion"
import TaskRow from "./TaskRow"

interface TaskGroupProps {
  title: string
  tasks: Task[]
  onToggleTask: (taskId: number) => void
  onEditTask: (task: Task) => void
  onViewTask: (task: Task) => void
}

function TaskGroup({
  title,
  tasks,
  onToggleTask,
  onEditTask,
  onViewTask,
}: TaskGroupProps) {
  if (tasks.length === 0) {
    return null
  }

  return (
    <section>
      <div className="flex items-center justify-between border-b border-border bg-muted/20 px-5 py-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">
            {title}
          </h2>

          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {tasks.length}
          </span>
        </div>
      </div>

      <m.div initial="hidden" animate="visible" variants={staggerContainer} className="divide-y divide-border">
        {tasks.map((task) => (
          <m.div key={task.id} variants={staggerItem}>
            <TaskRow
              task={task}
              onToggleTask={onToggleTask}
              onEditTask={onEditTask}
              onViewTask={onViewTask}
            />
          </m.div>
        ))}
      </m.div>
    </section>
  )
}

export default TaskGroup
