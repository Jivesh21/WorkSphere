import { AlertCircle } from "lucide-react"

interface FormErrorProps {
  message: string
}

export function FormError({ message }: FormErrorProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-[#4C1D24] bg-[#2A1315] px-3.5 py-3"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#F87171]" />

      <p className="text-[13px] leading-snug text-[#F87171]">
        {message}
      </p>
    </div>
  )
}