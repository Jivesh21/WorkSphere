export function WorkflowGraphic() {
  return (
    <div
      className="relative h-[300px] w-full max-w-[390px] auth-fade-in"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 390 300"
        className="absolute inset-0 h-full w-full"
        fill="none"
      >
        {/* Connection lines */}
        <line
          x1="65"
          y1="65"
          x2="195"
          y2="42"
          stroke="#6366F1"
          strokeOpacity="0.18"
          strokeWidth="1"
          className="auth-draw-line"
        />

        <line
          x1="195"
          y1="42"
          x2="320"
          y2="92"
          stroke="#6366F1"
          strokeOpacity="0.18"
          strokeWidth="1"
          className="auth-draw-line"
          style={{ animationDelay: "180ms" }}
        />

        <line
          x1="65"
          y1="65"
          x2="135"
          y2="170"
          stroke="#6366F1"
          strokeOpacity="0.12"
          strokeWidth="1"
          className="auth-draw-line"
          style={{ animationDelay: "320ms" }}
        />

        <line
          x1="135"
          y1="170"
          x2="270"
          y2="225"
          stroke="#6366F1"
          strokeOpacity="0.12"
          strokeWidth="1"
          className="auth-draw-line"
          style={{ animationDelay: "460ms" }}
        />

        <line
          x1="320"
          y1="92"
          x2="270"
          y2="225"
          stroke="#6366F1"
          strokeOpacity="0.12"
          strokeWidth="1"
          className="auth-draw-line"
          style={{ animationDelay: "600ms" }}
        />

        {/* Network nodes */}
        <circle
          cx="65"
          cy="65"
          r="4"
          fill="#6366F1"
          className="auth-node-glow"
        />

        <circle
          cx="195"
          cy="42"
          r="3.5"
          fill="#818CF8"
          className="auth-node-glow"
          style={{ animationDelay: "400ms" }}
        />

        <circle
          cx="320"
          cy="92"
          r="4"
          fill="#6366F1"
          className="auth-node-glow"
          style={{ animationDelay: "800ms" }}
        />

        <circle
          cx="135"
          cy="170"
          r="3.5"
          fill="#818CF8"
          className="auth-node-glow"
          style={{ animationDelay: "1200ms" }}
        />

        <circle
          cx="270"
          cy="225"
          r="4"
          fill="#6366F1"
          className="auth-node-glow"
          style={{ animationDelay: "1600ms" }}
        />

        {/* Small ambient nodes */}
        <circle
          cx="110"
          cy="105"
          r="2"
          fill="#6366F1"
          fillOpacity="0.35"
          className="auth-pulse"
        />

        <circle
          cx="255"
          cy="105"
          r="2"
          fill="#6366F1"
          fillOpacity="0.3"
          className="auth-pulse"
          style={{ animationDelay: "700ms" }}
        />

        <circle
          cx="205"
          cy="205"
          r="2"
          fill="#6366F1"
          fillOpacity="0.25"
          className="auth-pulse"
          style={{ animationDelay: "1100ms" }}
        />
      </svg>

      {/* Design review card */}
      <div className="absolute left-0 top-[105px] w-[175px] rounded-lg border border-[#1E1E22] bg-[#101014] p-3.5 shadow-[0_8px_24px_rgba(0,0,0,0.35)] auth-float">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#6366F1] shadow-[0_0_8px_rgba(99,102,241,0.5)]" />

          <span className="text-[12px] font-medium text-[#D4D4D8]">
            Design review
          </span>
        </div>

        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[#1E1E22]">
          <div className="auth-progress h-1 rounded-full bg-[#6366F1]" />
        </div>

        <div className="mt-2 flex justify-between">
          <span className="text-[10px] text-[#6B6B74]">
            Project Alpha
          </span>

          <span className="text-[10px] text-[#818CF8]">
            66%
          </span>
        </div>
      </div>

      {/* API rollout card */}
      <div
        className="absolute bottom-0 right-0 w-[158px] rounded-lg border border-[#1E1E22] bg-[#101014] p-3.5 shadow-[0_8px_24px_rgba(0,0,0,0.35)] auth-float-delayed"
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#9A9AA2]" />

          <span className="text-[12px] font-medium text-[#D4D4D8]">
            API rollout
          </span>
        </div>

        <p className="mt-2 text-[11px] text-[#6B6B74]">
          3 of 5 tasks completed
        </p>

        <div className="mt-2 flex gap-1">
          <span className="h-1 flex-1 rounded-full bg-[#6366F1]" />
          <span className="h-1 flex-1 rounded-full bg-[#6366F1]" />
          <span className="h-1 flex-1 rounded-full bg-[#6366F1]" />
          <span className="h-1 flex-1 rounded-full bg-[#1E1E22]" />
          <span className="h-1 flex-1 rounded-full bg-[#1E1E22]" />
        </div>
      </div>
    </div>
  )
}