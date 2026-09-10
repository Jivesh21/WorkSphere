import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import DashboardPage from "@/pages/DashboardPage"
import IssuesPage from "@/pages/IssuesPage"
import ProjectsPage from "@/pages/ProjectsPage"
import TeamsPage from "@/pages/TeamsPage/TeamsPage"
import MyWorkPage from "@/pages/MyWorkPage/MyWorkPage"
import WorkspacePage from "@/pages/Workspace/WorkspacePage"
import LoginPage from "@/pages/Auth/LoginPage"
import ProtectedRoute from "./ProtectedRoute"

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/workspace" element={<WorkspacePage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/issues" element={<IssuesPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/work" element={<MyWorkPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter