import { useState } from "react"
import { Eye, EyeOff, Lock } from "lucide-react"

import { FormField } from "./FormField"

interface PasswordFieldProps {
  id: string
  value: string
  onChange: (value: string) => void
  label?: string
  autoComplete?: string
  error?: string
  disabled?: boolean
}

export function PasswordField({
  id,
  value,
  onChange,
  label = "Password",
  autoComplete = "current-password",
  error,
  disabled,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <FormField
      id={id}
      label={label}
      type={visible ? "text" : "password"}
      value={value}
      disabled={disabled}
      error={error}
      icon={<Lock className="h-4 w-4" />}
      autoComplete={autoComplete}
      onChange={(event) => onChange(event.target.value)}
      rightSlot={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          disabled={disabled}
          tabIndex={-1}
          className="flex h-7 w-7 items-center justify-center rounded-md text-[#6B6B74] transition-colors hover:text-[#D4D4D8]"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      }
    />
  )
}