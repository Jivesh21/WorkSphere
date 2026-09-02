import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import ProjectsPage from "@/pages/ProjectsPage"
import DashboardPage from "@/pages/DashboardPage"
import MyWorkPage from "@/pages/MyWorkPage/MyWorkPage"
import TeamsPage from "@/pages/TeamsPage"
import IssuesPage from "@/pages/IssuesPage"
import WorkspacePage from "@/pages/Workspace/WorkspacePage"
function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />
<Route
  path="/workspace"
  element={<WorkspacePage />}
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
  path="/issues"
  element={<IssuesPage />}
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