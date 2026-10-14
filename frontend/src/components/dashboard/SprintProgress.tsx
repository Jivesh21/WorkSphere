import { ArrowUpRight, Target } from "lucide-react"

function SprintProgress() {
  const completed = 34
  const total = 50
  const progress = Math.round((completed / total) * 100)

  return (
    <section className="h-full min-h-[280px] overflow-hidden rounded-2xl border border-white/10 bg-[#111113] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-[#F4F4F6]">
            Sprint progress
          </h2>

          <p className="mt-1 text-xs text-[#9A9AA2]">
            Sprint 24 · 8 days left
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs font-medium text-[#9A9AA2] transition-colors hover:text-[#F4F4F6]"
        >
          View sprint
          <ArrowUpRight className="size-3.5" />
        </button>
      </div>

      <div className="mt-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-[42px] font-semibold leading-none tracking-[-0.05em] text-[#F4F4F6]">
            {progress}%
          </p>

          <p className="mt-2 text-xs text-[#9A9AA2]">
            completion
          </p>
        </div>

        <div className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.045]">
          <Target className="size-5 text-[#9A9AA2]" />
        </div>
      </div>

      <div className="mt-8">
        <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
          <div
            className="h-full rounded-full bg-[#22d3ee] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-[#9A9AA2]">
          <span>{completed} completed</span>
          <span>{total} total tasks</span>
        </div>
      </div>
    </section>
  )
}

export default SprintProgress