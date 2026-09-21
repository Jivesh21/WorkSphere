import { useEffect, useRef, useState } from "react"

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: fine)")

    if (!mediaQuery.matches) return

    const handleMouseMove = (event: MouseEvent) => {
      setIsVisible(true)

      const { clientX, clientY } = event

      if (cursorRef.current) {
        cursorRef.current.style.transform =
          `translate3d(${clientX}px, ${clientY}px, 0) translate(-50%, -50%)`
      }

      if (glowRef.current) {
        glowRef.current.style.transform =
          `translate3d(${clientX}px, ${clientY}px, 0) translate(-50%, -50%)`
      }
    }

    const handleMouseOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement

      setIsHovering(
        Boolean(
          target.closest(
            "button, a, input, textarea, select, [role='button']",
          ),
        ),
      )
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    window.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseover", handleMouseOver)
    document.documentElement.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseover", handleMouseOver)
      document.documentElement.removeEventListener(
        "mouseleave",
        handleMouseLeave,
      )
    }
  }, [])

  return (
    <>
      {/* Cursor glow */}
      <div
        ref={glowRef}
        className={`pointer-events-none fixed left-0 top-0 z-[9998] h-10 w-10 rounded-full bg-[#6366F1]/10 blur-xl transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Main cursor */}
      <div
        ref={cursorRef}
        className={`pointer-events-none fixed left-0 top-0 z-[9999] rounded-full transition-[width,height,opacity] duration-150 ${
          isHovering ? "h-7 w-7" : "h-3 w-3"
        } ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className={`h-full w-full rounded-full border transition-all duration-150 ${
            isHovering
              ? "border-[#818CF8] bg-[#6366F1]/15 shadow-[0_0_18px_rgba(99,102,241,0.35)]"
              : "border-[#818CF8] bg-[#6366F1] shadow-[0_0_10px_rgba(99,102,241,0.45)]"
          }`}
        />
      </div>
    </>
  )
}