import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

const ToastProvider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed top-0 right-0 z-[100] flex flex-col gap-2 w-full max-w-[420px] p-4",
      className
    )}
    {...props}
  />
))
ToastProvider.displayName = "ToastProvider"

const toastVariants = cva(
  "group relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 shadow-md transition-all",
  {
    variants: {
      variant: {
        default: "bg-background border-border",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  title?: string
  description?: string
  onClose?: () => void
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant, title, description, onClose, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        {...props}
      >
        <div className="flex flex-col gap-1">
          {title && <p className="font-medium">{title}</p>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {onClose && (
          <button
            className="inline-flex shrink-0 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}
      </div>
    )
  }
)
Toast.displayName = "Toast"

export { Toast, ToastProvider, toastVariants } 