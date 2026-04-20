"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

// ── Context ──────────────────────────────────────────────
type Ctx = { open: boolean; onOpenChange: (v: boolean) => void }
const DialogCtx = React.createContext<Ctx>({ open: false, onOpenChange: () => {} })

// ── Root ─────────────────────────────────────────────────
function Dialog({
  open = false,
  onOpenChange = () => {},
  children,
}: {
  open?: boolean
  onOpenChange?: (v: boolean) => void
  children?: React.ReactNode
}) {
  return (
    <DialogCtx.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogCtx.Provider>
  )
}

// ── Trigger (optional, for declarative usage) ────────────
function DialogTrigger({ children, ...props }: React.ComponentProps<"button">) {
  const { onOpenChange } = React.useContext(DialogCtx)
  return (
    <button type="button" onClick={() => onOpenChange(true)} {...props}>
      {children}
    </button>
  )
}

// ── Portal (pass-through, kept for API compat) ───────────
function DialogPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

// ── Overlay ───────────────────────────────────────────────
function DialogOverlay({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-overlay"
      className={cn("fixed inset-0 z-50 bg-black/50 backdrop-blur-sm", className)}
      {...props}
    />
  )
}

// ── Close ─────────────────────────────────────────────────
function DialogClose({ children, ...props }: React.ComponentProps<"button">) {
  const { onOpenChange } = React.useContext(DialogCtx)
  return (
    <button type="button" onClick={() => onOpenChange(false)} {...props}>
      {children}
    </button>
  )
}

// ── Content ───────────────────────────────────────────────
function DialogContent({
  className,
  children,
  showCloseButton = true,
  noPadding = false,
  ...props
}: React.ComponentProps<"div"> & { showCloseButton?: boolean; noPadding?: boolean }) {
  const { open, onOpenChange } = React.useContext(DialogCtx)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => { setMounted(true) }, [])

  // Close on Escape
  React.useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onOpenChange])

  if (!mounted || !open) return null

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      {/* Panel */}
      <div
        data-slot="dialog-content"
        className={cn(
          "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
          "w-full max-w-[calc(100%-2rem)] sm:max-w-lg",
          "bg-white rounded-2xl shadow-2xl",
          !noPadding && "max-h-[90vh] overflow-y-auto",
          className
        )}
        onClick={e => e.stopPropagation()}
        {...props}
      >
        {noPadding ? children : <div className="p-6">{children}</div>}
        {showCloseButton && (
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 z-10 rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-gray-100 transition-colors"
          >
            <X size={16} />
            <span className="sr-only">Close</span>
          </button>
        )}
      </div>
    </>,
    document.body
  )
}

// ── Header ────────────────────────────────────────────────
function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 mb-4", className)}
      {...props}
    />
  )
}

// ── Title ─────────────────────────────────────────────────
function DialogTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="dialog-title"
      className={cn("text-base font-semibold leading-none", className)}
      {...props}
    />
  )
}

// ── Description ───────────────────────────────────────────
function DialogDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

// ── Footer ────────────────────────────────────────────────
function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & { showCloseButton?: boolean }) {
  const { onOpenChange } = React.useContext(DialogCtx)
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end", className)}
      {...props}
    >
      {children}
      {showCloseButton && (
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Close
        </button>
      )}
    </div>
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
