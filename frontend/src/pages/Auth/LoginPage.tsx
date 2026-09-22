import { useState } from "react"
import type { FormEvent } from "react"

import { Link, useNavigate } from "react-router-dom"
import { Mail, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import useAuth from "@/hooks/useAuth"

import { AuthLogo } from "./components/AuthLogo"
import { AuthBrandPanel } from "./components/AuthBrandPanel"
import { FormField } from "./components/FormField"
import { PasswordField } from "./components/PasswordField"
import { FormError } from "./components/FormError"
import { CustomCursor } from "./components/CustomCursor"

import "./auth-animations.css"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  })

  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const emailError =
    touched.email && !email
      ? "Email is required"
      : touched.email && !EMAIL_REGEX.test(email)
        ? "Enter a valid email address"
        : undefined

  const passwordError =
    touched.password && !password
      ? "Password is required"
      : undefined

  const isValid =
    EMAIL_REGEX.test(email) &&
    password.length > 0

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    setTouched({
      email: true,
      password: true,
    })

    setError("")

    if (!isValid) return

    setIsSubmitting(true)

    try {
      await login({
        email,
        password,
      })

      navigate("/dashboard", {
        replace: true,
      })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Try again.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page flex min-h-screen bg-[#08080A]">
      <CustomCursor />

      <AuthBrandPanel />

      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-10 md:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="mb-10 md:hidden auth-fade-up">
            <AuthLogo />
          </div>

          {/* Heading */}
          <div className="mb-8 auth-fade-up auth-delay-1">
            <h1 className="text-2xl font-semibold tracking-tight text-[#F4F4F6]">
              Welcome back
            </h1>

            <p className="mt-1.5 text-[14px] text-[#9A9AA2]">
              Sign in to continue to your workspace.
            </p>
          </div>

          {/* Login form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-5 auth-fade-up auth-delay-2"
          >
            {error && <FormError message={error} />}

            <FormField
              id="email"
              label="Email"
              type="email"
              value={email}
              autoComplete="email"
              placeholder="you@company.com"
              icon={<Mail className="h-4 w-4" />}
              error={emailError}
              disabled={isSubmitting}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              onBlur={() =>
                setTouched((current) => ({
                  ...current,
                  email: true,
                }))
              }
            />

            <PasswordField
              id="password"
              value={password}
              onChange={setPassword}
              error={passwordError}
              disabled={isSubmitting}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full bg-[#6366F1] text-[14px] font-medium text-white transition-all duration-200 hover:bg-[#4F46E5] hover:shadow-[0_8px_24px_rgba(99,102,241,0.18)] active:scale-[0.99] disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          {/* Register link */}
          <p className="mt-8 text-center text-[13.5px] text-[#9A9AA2] auth-fade-up auth-delay-3">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-[#818CF8] transition-colors hover:text-[#A5B4FC]"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

export default LoginPage