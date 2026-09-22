import { AuthLogo } from "./AuthLogo"
import { WorkflowGraphic } from "./WorkflowGraphic"

export function AuthBrandPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#0B0B10] to-[#101018] md:flex md:w-[38%] md:flex-col md:justify-between md:px-10 md:py-10 lg:w-[45%] lg:px-16 lg:py-14">
      <div
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#6366F1] opacity-[0.06] blur-3xl auth-fade-in"
        aria-hidden="true"
      />

      <div className="auth-fade-up">
        <AuthLogo />
      </div>

      <div className="relative z-10 max-w-md auth-fade-up auth-delay-1">
        <h1 className="text-3xl font-semibold leading-tight tracking-tight text-[#F4F4F6] lg:text-4xl">
          Your team&apos;s work,
          <br />
          connected in one sphere.
        </h1>

        <p className="mt-4 max-w-[38ch] text-[15px] leading-relaxed text-[#9A9AA2]">
          Plan projects, manage tasks, share work, and collaborate with your
          team from one workspace.
        </p>
      </div>

      <div className="relative z-10 hidden lg:flex lg:justify-center auth-fade-up auth-delay-3">
        <WorkflowGraphic />
      </div>
    </div>
  )
}