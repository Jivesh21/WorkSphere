import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import ProjectsPage from "@/pages/ProjectsPage"
import DashboardPage from "@/pages/DashboardPage"
import MyWorkPage from "@/pages/MyWorkPage"
import TeamsPage from "@/pages/TeamsPage"
function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />
        <Route
  path="/teams"
  element={<TeamsPage />}
/>
<Route
  path="/projects"
  element={<ProjectsPage />}
/>
        <Route
          path="/work"
          element={<MyWorkPage />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter