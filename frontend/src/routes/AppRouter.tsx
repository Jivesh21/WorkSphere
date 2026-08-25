import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import DashboardPage from "@/pages/DashboardPage"

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
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter