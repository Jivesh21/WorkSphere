import { Navigate, Outlet } from "react-router-dom"
import useAuth from "@/hooks/useAuth"

function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08080A]">
        <p className="text-sm text-zinc-400">Loading...</p>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export default PublicRoute
