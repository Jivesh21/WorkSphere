import { forwardRef } from "react"
import type { InputHTMLAttributes, ReactNode } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  icon?: ReactNode
  rightSlot?: ReactNode
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, icon, rightSlot, id, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        <Label
          htmlFor={id}
          className="text-[13px] font-medium text-[#D4D4D8]"
        >
          {label}
        </Label>

        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[#6B6B74]">
              {icon}
            </span>
          )}

          <Input
            id={id}
            ref={ref}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
            className={cn(
              "h-11 border-[#1E1E22] bg-[#101014] text-[14px] text-[#F4F4F6]",
              "placeholder:text-[#6B6B74]",
              "transition-colors duration-150",
              "focus-visible:border-[#6366F1] focus-visible:ring-2 focus-visible:ring-[#6366F1]/30",
              "[&:-webkit-autofill]:[-webkit-text-fill-color:#F4F4F6]",
              "[&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_#101014_inset]",
              icon && "pl-9",
              rightSlot && "pr-10",
              error &&
                "border-[#4C1D24] focus-visible:border-[#F87171] focus-visible:ring-[#F87171]/20",
              className,
            )}
            {...props}
          />

          {rightSlot && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2">
              {rightSlot}
            </span>
          )}
        </div>

        {error && (
          <p id={`${id}-error`} className="text-[12.5px] text-[#F87171]">
            {error}
          </p>
        )}
      </div>
    )
  },
)

FormField.displayName = "FormField"