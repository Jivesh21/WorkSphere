interface SummaryCardProps {
  label: string
  value: string
  description: string
}

function SummaryCard({
  label,
  value,
  description,
}: SummaryCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground">
        {label}
      </p>

      <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

export default SummaryCard