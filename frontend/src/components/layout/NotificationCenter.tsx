import { useEffect, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Bell, Check, CircleAlert, ExternalLink, RefreshCw } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import useAuth from "@/hooks/useAuth"
import { getUserNotifications, markNotificationRead } from "@/services/notificationService"
import type { NotificationRecord } from "@/types/notifications"

function getDestination(notification: NotificationRecord) {
  if (isValidTarget(notification.issueId)) return { path: "/issues", label: "View issues" }
  if (isValidTarget(notification.taskId)) return { path: "/work", label: "View work" }
  if (isValidTarget(notification.projectId)) return { path: "/projects", label: "View projects" }
  return null
}

function isValidTarget(id: number | null) {
  return id !== null && Number.isSafeInteger(id) && id > 0
}

function notificationDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date)
}

function NotificationCenter() {
  const { user, accessToken } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const queryKey = ["notifications", user?.id] as const

  const notificationsQuery = useQuery({
    queryKey,
    queryFn: () => getUserNotifications(user!.id, accessToken!),
    enabled: Boolean(user && accessToken),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    retry: 1,
  })

  const markReadMutation = useMutation({
    mutationFn: (notificationId: number) => markNotificationRead(notificationId, accessToken!),
    onSuccess: (updatedNotification) => {
      queryClient.setQueryData<NotificationRecord[]>(queryKey, (current) =>
        current?.map((notification) => notification.id === updatedNotification.id ? updatedNotification : notification),
      )
      void queryClient.invalidateQueries({ queryKey })
    },
  })

  useEffect(() => {
    if (!user) queryClient.removeQueries({ queryKey: ["notifications"] })
  }, [queryClient, user])

  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    function onPointerDown(event: MouseEvent) {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("mousedown", onPointerDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("mousedown", onPointerDown)
    }
  }, [open])

  if (!user || !accessToken) return null

  const notifications = notificationsQuery.data ?? []
  const unreadCount = notifications.filter((notification) => notification.status === "UNREAD").length
  const error = notificationsQuery.error ?? markReadMutation.error

  function openDestination(destination: ReturnType<typeof getDestination>) {
    if (!destination) return
    setOpen(false)
    navigate(destination.path)
  }

  function markRead(notification: NotificationRecord) {
    if (notification.status === "UNREAD" && !markReadMutation.isPending) {
      markReadMutation.reset()
      markReadMutation.mutate(notification.id)
    }
  }

  return (
    <div className="relative" ref={rootRef}>
      <Button ref={triggerRef} type="button" variant="ghost" size="icon" aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"} aria-expanded={open} aria-controls="notification-panel" onClick={() => setOpen((value) => !value)} className="relative">
        <Bell className="size-4" aria-hidden="true" />
        {unreadCount > 0 && <span aria-hidden="true" className="absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold leading-4 text-primary-foreground">{unreadCount > 9 ? "9+" : unreadCount}</span>}
      </Button>

      {open && <section id="notification-panel" aria-label="Notifications" className="absolute right-0 top-full z-50 mt-2 flex max-h-[min(32rem,calc(100dvh-5rem))] w-[min(23rem,calc(100vw-1rem))] flex-col overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-xl">
        <header className="flex items-center justify-between border-b border-border px-3.5 py-3">
          <div><h2 className="text-sm font-semibold">Notifications</h2><p className="mt-0.5 text-[11px] text-muted-foreground">{unreadCount ? `${unreadCount} unread` : "Updates for your account"}</p></div>
          <Button type="button" variant="ghost" size="sm" onClick={() => void notificationsQuery.refetch()} disabled={notificationsQuery.isFetching} className="h-7 gap-1.5 px-2 text-xs">
            <RefreshCw className={`size-3 ${notificationsQuery.isFetching ? "animate-spin motion-reduce:animate-none" : ""}`} aria-hidden="true" />Refresh
          </Button>
        </header>

        {error && <div role="alert" className="flex items-start gap-2 border-b border-destructive/20 bg-destructive/5 px-3.5 py-2.5 text-xs text-destructive">
          <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span className="min-w-0 flex-1">{error instanceof Error ? error.message : "Could not update notifications."}</span>
          {notificationsQuery.isError && <button type="button" onClick={() => void notificationsQuery.refetch()} className="shrink-0 font-medium underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-ring">Retry</button>}
        </div>}

        {notificationsQuery.isPending ? <p role="status" className="px-4 py-8 text-center text-xs text-muted-foreground">Loading notifications...</p>
          : notifications.length === 0 ? <p className="px-4 py-9 text-center text-xs text-muted-foreground">{notificationsQuery.isError ? "Notifications could not be loaded." : "You are all caught up."}</p>
          : <ul className="overflow-y-auto">
            {notifications.slice(0, 30).map((notification) => {
              const destination = getDestination(notification)
              const unread = notification.status === "UNREAD"
              return <li key={notification.id} className={`border-b border-border last:border-b-0 ${unread ? "bg-accent/30" : ""}`}>
                <div className="flex items-start gap-2 px-3 py-3">
                  <span className="mt-1 flex size-4 shrink-0 items-center justify-center" role="img" aria-label={unread ? "Unread" : "Read"}>
                    {unread ? <span className="size-1.5 rounded-full bg-primary" /> : <Check className="size-3 text-muted-foreground/50" aria-hidden="true" />}
                  </span>
                  {destination ? <button type="button" onClick={() => openDestination(destination)} className="min-w-0 flex-1 text-left outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring">
                    <span className="block text-xs font-medium leading-relaxed">{notification.title}</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{notification.message}</span>
                    <span className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">{notificationDate(notification.createdAt)}<span aria-hidden="true">|</span><ExternalLink className="size-3" aria-hidden="true" />{destination.label}</span>
                  </button> : <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium leading-relaxed">{notification.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{notification.message}</p>
                    <p className="mt-1.5 text-[10px] text-muted-foreground">{notificationDate(notification.createdAt)}</p>
                  </div>}
                  {unread && <button type="button" aria-label={`Mark ${notification.title} as read`} title="Mark as read" disabled={markReadMutation.isPending} onClick={() => markRead(notification)} className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"><Check className="size-3.5" aria-hidden="true" /></button>}
                </div>
              </li>
            })}
            {notifications.length > 30 && <li className="px-3 py-2 text-center text-[10px] text-muted-foreground">Showing the 30 most recent notifications</li>}
          </ul>}

        <footer className="border-t border-border px-3.5 py-2"><p className="text-[10px] text-muted-foreground">Refreshes every minute. Live delivery is not configured.</p></footer>
      </section>}
    </div>
  )
}

export default NotificationCenter
