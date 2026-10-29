import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import DashboardPage from "@/pages/DashboardPage"
import IssuesPage from "@/pages/IssuesPage"
import ProjectsPage from "@/pages/ProjectsPage"
import BoardPage from "@/pages/BoardPage"
import TeamsPage from "@/pages/TeamsPage/TeamsPage"
import MyWorkPage from "@/pages/MyWorkPage/MyWorkPage"
import WorkspacePage from "@/pages/Workspace/WorkspacePage"
import LoginPage from "@/pages/Auth/LoginPage"
import RegisterPage from "@/pages/Auth/RegisterPage"
import ProfilePage from "@/pages/ProfilePage"
import AccountSettingsPage from "@/pages/AccountSettingsPage"
import DevPreviewPage from "@/pages/DevPreviewPage"
import ProtectedRoute from "./ProtectedRoute"
import PublicRoute from "./PublicRoute"

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {import.meta.env.DEV && <Route path="/dev-preview" element={<DevPreviewPage />} />}
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/workspace" element={<WorkspacePage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/issues" element={<IssuesPage />} />
          <Route path="/board" element={<BoardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/work" element={<MyWorkPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<AccountSettingsPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
