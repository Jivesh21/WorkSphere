import { cn } from "@/lib/utils"

interface AuthLogoProps {
  className?: string
}

export function AuthLogo({ className }: AuthLogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#1A1A2A] to-[#0A0A12] p-1.5 border border-[#2A2A3D] shadow-md">
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
        >
          <defs>
            <linearGradient id="authBrandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A5B4FC" />
              <stop offset="50%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
          </defs>
          <circle cx="16" cy="16" r="10" stroke="url(#authBrandGrad)" strokeWidth="2.2" fill="none" />
          <ellipse cx="16" cy="16" rx="5.8" ry="3.6" transform="rotate(-35 16 16)" fill="url(#authBrandGrad)" />
          <circle cx="20.5" cy="7.2" r="2.2" fill="url(#authBrandGrad)" />
          <circle cx="9.2" cy="22.5" r="2.2" fill="url(#authBrandGrad)" />
          <circle cx="23.5" cy="20.5" r="1.4" fill="url(#authBrandGrad)" />
        </svg>
      </div>

      <span className="text-[16px] font-semibold tracking-tight text-[#F4F4F6]">
        WorkSphere
      </span>
    </div>
  )
}

export default AuthLogo