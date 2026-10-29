import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { LazyMotion, MotionConfig, domAnimation } from "motion/react"
import "./index.css"
import App from "./App"
import AuthProvider from "@/contexts/AuthContext"
import { ThemeProvider } from "@/contexts/ThemeContext"
import { IssuesProvider } from "@/contexts/IssuesProvider"
import { ProjectsProvider } from "@/contexts/ProjectsProvider"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: true,
    },
  },
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="user">
          <ThemeProvider>
            <AuthProvider>
              <IssuesProvider>
                <ProjectsProvider>
                  <App />
                </ProjectsProvider>
              </IssuesProvider>
            </AuthProvider>
          </ThemeProvider>
        </MotionConfig>
      </LazyMotion>
    </QueryClientProvider>
  </StrictMode>,
)
