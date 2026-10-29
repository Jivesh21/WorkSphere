import type { ReactNode } from "react"
import * as m from "motion/react-m"

import Sidebar from "@/components/layout/Sidebar"
import TopNavbar from "@/components/layout/TopNavbar"
import GlobalVoiceAssistant from "@/components/layout/GlobalVoiceAssistant"
import { pageEnter } from "@/lib/motion"
import useAuth from "@/hooks/useAuth"
import { useNavigate } from "react-router-dom"

interface DashboardLayoutProps {
  children: ReactNode
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate()
  const { isDevelopmentPreview, logout } = useAuth()

  async function exitPreview() {
    await logout()
    navigate("/login", { replace: true })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Fixed sidebar */}
      <Sidebar />

      {/* Main application */}
      <div className="min-h-screen lg:pl-[224px]">
        {isDevelopmentPreview && (
          <div role="status" className="flex flex-wrap items-center justify-between gap-2 border-b border-primary/20 bg-primary/5 px-4 py-2.5 text-sm text-foreground sm:px-5 md:px-6">
            <p><span className="font-semibold text-primary">Local development preview</span> · Dashboard workspace data is sample data.</p>
            <button type="button" onClick={() => void exitPreview()} className="rounded px-2 py-1 font-medium text-primary outline-none transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring">Exit preview</button>
          </div>
        )}
        <TopNavbar />

        <main className="min-h-[calc(100vh-56px)] overflow-x-hidden">
          <div className="p-4 sm:p-5 lg:px-6 lg:py-5">
            <m.div {...pageEnter}>{children}</m.div>
          </div>
        </main>
      </div>
      <GlobalVoiceAssistant />
    </div>
  )
}

export default DashboardLayout
