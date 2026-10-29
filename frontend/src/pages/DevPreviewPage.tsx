import { Link, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import useAuth from "@/hooks/useAuth"

function DevPreviewPage() {
  const navigate = useNavigate()
  const { startDevelopmentPreview } = useAuth()

  function openPreview() {
    if (!import.meta.env.DEV) return
    startDevelopmentPreview()
    navigate("/dashboard", { replace: true })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10 text-foreground">
      <section className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Local development only</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">WorkSphere UI preview</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Open the dashboard without connecting to the backend. It uses clearly labeled sample tasks, issues, projects, activity, and team workload stored only for this local preview.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" onClick={openPreview}>Open UI preview</Button>
          <Link to="/login" className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            Return to login
          </Link>
        </div>
      </section>
    </main>
  )
}

export default DevPreviewPage
