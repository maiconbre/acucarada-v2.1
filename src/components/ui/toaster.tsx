import { useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts, dismiss } = useToast()
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Auto-dismiss toasts after 1.5 seconds
  useEffect(() => {
    const timers = timersRef.current
    
    // Add timers for new toasts
    toasts.forEach((toast) => {
      if (!timers.has(toast.id)) {
        const timer = setTimeout(() => {
          dismiss(toast.id)
          timers.delete(toast.id)
        }, 1500)
        timers.set(toast.id, timer)
      }
    })

    // Clean up timers for removed toasts
    const currentToastIds = new Set(toasts.map(t => t.id))
    timers.forEach((timer, id) => {
      if (!currentToastIds.has(id)) {
        clearTimeout(timer)
        timers.delete(id)
      }
    })

    // Cleanup all timers on unmount
    return () => {
      timers.forEach(timer => clearTimeout(timer))
      timers.clear()
    }
  }, [toasts, dismiss])

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
