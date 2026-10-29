interface TaskProgressBarProps {
  value: number | null
  className?: string
}

function TaskProgressBar({ value, className = "" }: TaskProgressBarProps) {
  if (value === null) {
    return <span aria-label="Progress not tracked" className={`inline-flex items-center text-[10px] leading-none text-muted-foreground ${className}`}>Not tracked</span>
  }
  const safeValue = Math.min(100, Math.max(0, Math.round(value)))
  return (
    <div
      role="progressbar"
      aria-label="Task progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safeValue}
      aria-valuetext={`${safeValue}% complete`}
      className={`h-1.5 overflow-hidden rounded-full bg-muted ${className}`}
    >
      <span className="block h-full rounded-full bg-primary transition-[width] duration-200 motion-reduce:transition-none" style={{ width: `${safeValue}%` }} />
    </div>
  )
}

export default TaskProgressBar
