import type { ReactNode } from "react"

import Sidebar from "@/components/layout/Sidebar"
import TopNavbar from "@/components/layout/TopNavbar"

interface DashboardLayoutProps {
  children: ReactNode
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Fixed sidebar */}
      <Sidebar />

      {/* Main application */}
      <div className="min-h-screen lg:pl-[308px]">
        <TopNavbar />

        <main className="min-h-[calc(100vh-70px)] overflow-x-hidden">
          <div className="p-5 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout