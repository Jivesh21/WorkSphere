import { useEffect, useRef, useState } from "react"
import { LoaderCircle, Mic, MicOff, X } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { getSpeechRecognitionConstructor, type SpeechRecognitionLike } from "@/lib/speechRecognition"
import { mapGeminiVoiceIntent, resolveVoiceCommand, type VoiceCommand } from "@/lib/voiceCommands"
import { interpretVoiceIntent } from "@/services/assistantService"
import useAuth from "@/hooks/useAuth"

type AssistantState = "idle" | "listening" | "processing" | "error"

const speechErrors: Record<string, string> = {
  "not-allowed": "Microphone permission was denied. Allow access in your browser and try again.",
  "service-not-allowed": "Speech recognition is blocked by your browser or device policy.",
  "no-speech": "No speech was detected. Try again in a quieter place.",
  "audio-capture": "No microphone is available to the browser.",
  network: "The browser speech service could not be reached. Try again later.",
  aborted: "Voice capture was stopped.",
}

function GlobalVoiceAssistant() {
  const navigate = useNavigate()
  const { accessToken } = useAuth()
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<AssistantState>("idle")
  const [message, setMessage] = useState("Choose Start listening when you’re ready to speak.")
  const [transcript, setTranscript] = useState("")
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const recognitionConstructor = getSpeechRecognitionConstructor()

  useEffect(() => () => recognitionRef.current?.abort(), [])

  useEffect(() => {
    function handleCommandApplied(event: Event) {
      const customEvent = event as CustomEvent<{ label?: string }>
      setState("idle")
      setMessage(`Applied ${customEvent.detail?.label ?? "the requested filter"}.`)
    }
    window.addEventListener("worksphere:voice-command-applied", handleCommandApplied)
    return () => window.removeEventListener("worksphere:voice-command-applied", handleCommandApplied)
  }, [])

  function executeCommand(command: VoiceCommand) {
    if (command.kind === "filter-tasks") {
      setMessage(`Opening My Work and applying ${command.label}…`)
      navigate("/work", { state: { voiceAssistant: { kind: command.kind, filter: command.filter, label: command.label } } })
      return
    }
    setState("idle")
    setMessage(`Opening ${command.label}.`)
    navigate(command.path)
  }

  async function interpretAndExecute(transcriptText: string) {
    const deterministicCommand = resolveVoiceCommand(transcriptText)
    if (deterministicCommand) {
      executeCommand(deterministicCommand)
      return
    }

    if (!accessToken) {
      setState("error")
      setMessage("Your sign-in session is unavailable. Sign in again before using voice commands.")
      return
    }

    try {
      const modelIntent = await interpretVoiceIntent(transcriptText, accessToken)
      const interpreted = mapGeminiVoiceIntent(modelIntent)
      if (!interpreted) {
        setState("error")
        setMessage("The assistant returned an invalid intent. No action was taken; try a supported command.")
        return
      }
      if (interpreted.kind === "unsupported") {
        setState("idle")
        setMessage("That action isn’t supported yet. Try opening a workspace page or filtering My Work tasks.")
        return
      }
      if (interpreted.kind === "clarification-required") {
        setState("idle")
        setMessage("I couldn’t tell which page or task filter you meant. Please clarify, for example: “Open Board” or “Show overdue tasks”.")
        return
      }
      executeCommand(interpreted.command)
    } catch (error) {
      setState("error")
      setMessage(error instanceof Error ? error.message : "The assistant service could not be reached. No action was taken.")
    }
  }

  function startListening() {
    setTranscript("")
    setMessage("")
    if (!recognitionConstructor) {
      setState("error")
      setMessage("Speech recognition is not supported in this browser. Use the workspace navigation instead.")
      return
    }

    try {
      const recognition = new recognitionConstructor()
      recognitionRef.current = recognition
      recognition.lang = navigator.language || "en-US"
      recognition.continuous = false
      recognition.interimResults = false
      let receivedResult = false

      recognition.onstart = () => {
        setState("listening")
        setMessage("Listening. Speak one navigation command, then pause.")
      }
      recognition.onresult = (event) => {
        receivedResult = true
        const spokenText = event.results[0]?.[0]?.transcript?.trim() ?? ""
        setTranscript(spokenText)
        setState("processing")
        setMessage("Checking the request against supported workspace actions…")
        if (!spokenText) {
          setState("error")
          setMessage("No speech was recognized. Start listening and try again.")
          return
        }
        void interpretAndExecute(spokenText)
      }
      recognition.onerror = (event) => {
        setState("error")
        setMessage(speechErrors[event.error] ?? "Speech recognition failed. Try again or use the workspace navigation.")
      }
      recognition.onend = () => {
        if (!receivedResult) {
          setState((current) => current === "listening" ? "idle" : current)
          setMessage((current) => current || "Listening stopped. Start again when you’re ready.")
        }
        recognitionRef.current = null
      }
      recognition.start()
      setState("listening")
      setMessage("Starting microphone…")
    } catch {
      recognitionRef.current = null
      setState("error")
      setMessage("The microphone could not be started. Check browser permission and try again.")
    }
  }

  function stopListening() {
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null
      recognitionRef.current.onerror = null
      recognitionRef.current.onend = null
      recognitionRef.current.abort()
    }
    recognitionRef.current = null
    setState("idle")
    setMessage("Voice capture stopped. No command was run.")
  }

  function closePanel() {
    if (state === "listening") stopListening()
    setOpen(false)
  }

  const statusColor = state === "error" ? "text-destructive" : state === "listening" ? "text-primary" : "text-muted-foreground"

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
      {open && (
        <section
          id="global-voice-panel"
          aria-labelledby="global-voice-title"
          className="w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-xl shadow-black/10"
          onKeyDown={(event) => { if (event.key === "Escape") closePanel() }}
        >
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h2 id="global-voice-title" className="text-sm font-semibold">Workspace voice assistant</h2>
              <p className="mt-0.5 text-[10px] text-muted-foreground">One command at a time · no wake word</p>
            </div>
            <button type="button" onClick={closePanel} aria-label="Close voice assistant" className="flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
              <X className="size-4" aria-hidden="true" />
            </button>
          </header>
          <div className="space-y-3 p-4">
            <p role="status" aria-live="polite" className={`flex min-h-10 items-start gap-2 text-xs leading-5 ${statusColor}`}>
              {state === "listening" && <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-primary ring-4 ring-primary/10" />}
              {state === "processing" && <LoaderCircle aria-hidden="true" className="mt-1 size-3.5 shrink-0 animate-spin motion-reduce:animate-none" />}
              {state === "error" && <span aria-hidden="true" className="mt-1 size-2 shrink-0 rounded-full bg-destructive" />}
              <span>{message}</span>
            </p>
            {transcript && <p className="rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-foreground"><span className="mb-0.5 block text-[10px] font-medium text-muted-foreground">Recognized request</span>{transcript}</p>}
            <p className="text-[10px] leading-4 text-muted-foreground">Try “Open My Work”, “Show my overdue tasks”, “Show my high-priority tasks”, “Show completed tasks”, or “Go to Teams”.</p>
            <button
              type="button"
              onClick={state === "listening" ? stopListening : startListening}
              aria-pressed={state === "listening"}
              disabled={state === "processing"}
              className={`inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border px-3 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none ${state === "listening" ? "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15" : "border-primary/25 bg-primary text-primary-foreground hover:bg-primary/90"}`}
            >
              {state === "listening" ? <MicOff className="size-4" aria-hidden="true" /> : <Mic className="size-4" aria-hidden="true" />}
              {state === "listening" ? "Stop listening" : state === "processing" ? "Processing request" : "Start listening"}
            </button>
          </div>
        </section>
      )}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls="global-voice-panel"
        aria-label={open ? "Close workspace voice assistant" : "Open workspace voice assistant"}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-primary/25 bg-card px-4 text-xs font-semibold text-primary shadow-lg shadow-black/10 outline-none transition-colors hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
      >
        <Mic className="size-4" aria-hidden="true" />
        <span className="hidden sm:inline">Voice assistant</span>
        <span className="sm:hidden">Assistant</span>
      </button>
    </div>
  )
}

export default GlobalVoiceAssistant
