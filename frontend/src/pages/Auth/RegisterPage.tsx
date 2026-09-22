import { useState } from "react"
import type { FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { User as UserIcon, Mail, Loader2, CheckCircle2 } from "lucide-react"

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

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  })

  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const nameError =
    touched.name && !name.trim()
      ? "Full name is required"
      : touched.name && name.trim().length > 100
        ? "Name cannot exceed 100 characters"
        : undefined

  const emailError =
    touched.email && !email
      ? "Email is required"
      : touched.email && !EMAIL_REGEX.test(email)
        ? "Enter a valid email address"
        : undefined

  const passwordError =
    touched.password && !password
      ? "Password is required"
      : touched.password && password.length < 8
        ? "Password must be at least 8 characters"
        : undefined

  const confirmPasswordError =
    touched.confirmPassword && !confirmPassword
      ? "Please confirm your password"
      : touched.confirmPassword && password !== confirmPassword
        ? "Passwords do not match"
        : undefined

  const isValid =
    name.trim().length > 0 &&
    name.trim().length <= 100 &&
    EMAIL_REGEX.test(email) &&
    password.length >= 8 &&
    password === confirmPassword

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    })

    setError("")

    if (!isValid) return

    setIsSubmitting(true)

    try {
     await register({
  name: name.trim(),
  email: email.trim(),
  password,
})

navigate("/login", {
  replace: true,
})
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create account. Please try again.",
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
              Create an account
            </h1>

            <p className="mt-1.5 text-[14px] text-[#9A9AA2]">
              Get started with WorkSphere today.
            </p>
          </div>

          {/* Register form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-4 auth-fade-up auth-delay-2"
          >
            {error && <FormError message={error} />}

            <FormField
              id="name"
              label="Full Name"
              type="text"
              value={name}
              autoComplete="name"
              placeholder="Your Name"
              icon={<UserIcon className="h-4 w-4" />}
              error={nameError}
              disabled={isSubmitting}
              onChange={(event) => setName(event.target.value)}
              onBlur={() =>
                setTouched((current) => ({
                  ...current,
                  name: true,
                }))
              }
            />

            <FormField
              id="email"
              label="Email Address"
              type="email"
              value={email}
              autoComplete="email"
              placeholder="you@company.com"
              icon={<Mail className="h-4 w-4" />}
              error={emailError}
              disabled={isSubmitting}
              onChange={(event) => setEmail(event.target.value)}
              onBlur={() =>
                setTouched((current) => ({
                  ...current,
                  email: true,
                }))
              }
            />

            <PasswordField
              id="password"
              label="Password"
              autoComplete="new-password"
              value={password}
              onChange={setPassword}
              error={passwordError}
              disabled={isSubmitting}
            />

            <PasswordField
              id="confirmPassword"
              label="Confirm Password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              error={confirmPasswordError}
              disabled={isSubmitting}
            />

            {/* Password length hint */}
            <div className="flex items-center gap-1.5 text-[12px] text-[#8E8E9A] pt-1">
              <CheckCircle2
                className={`h-3.5 w-3.5 transition-colors ${password.length >= 8 ? "text-emerald-400" : "text-[#52525B]"
                  }`}
              />
              <span>At least 8 characters long</span>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 h-11 w-full bg-[#6366F1] text-[14px] font-medium text-white transition-all duration-200 hover:bg-[#4F46E5] hover:shadow-[0_8px_24px_rgba(99,102,241,0.18)] active:scale-[0.99] disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Login link */}
          <p className="mt-8 text-center text-[13.5px] text-[#9A9AA2] auth-fade-up auth-delay-3">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-[#818CF8] transition-colors hover:text-[#A5B4FC]"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

export default RegisterPage
