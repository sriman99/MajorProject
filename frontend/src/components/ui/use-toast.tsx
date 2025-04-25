import * as React from "react"
import { X } from "lucide-react"

import type { ToastProps } from "./toast"

type ToastActionElement = React.ReactElement

export type ToastOptions = ToastProps & {
  id?: string
  action?: ToastActionElement
  duration?: number
}

type ToastState = {
  toasts: ToastOptions[]
}

const TOAST_REMOVE_DELAY = 3000

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function generateId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToastOptions
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToastOptions>
      id: string
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      id: string
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      id: string
    }

interface ToastContextValue extends ToastState {
  toast: (props: ToastOptions) => string
  dismiss: (toastId: string) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

function toastReducer(state: ToastState, action: Action): ToastState {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [...state.toasts, action.toast],
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.id ? { ...t, ...action.toast } : t
        ),
      }

    case actionTypes.DISMISS_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.id ? { ...t, dismissed: true } : t
        ),
      }

    case actionTypes.REMOVE_TOAST:
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.id),
      }

    default:
      return state
  }
}

export function ToastProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  const [state, dispatch] = React.useReducer(toastReducer, {
    toasts: [],
  })

  const toast = React.useMemo(
    () => ({
      ...state,
      toast: (props: ToastOptions) => {
        const id = props.id || generateId()

        dispatch({
          type: actionTypes.ADD_TOAST,
          toast: {
            ...props,
            id,
            duration: props.duration || 5000,
          },
        })

        return id
      },
      dismiss: (toastId: string) => {
        dispatch({ type: actionTypes.DISMISS_TOAST, id: toastId })
      },
    }),
    [state]
  )

  return <ToastContext.Provider value={toast}>{children}</ToastContext.Provider>
}

export function useToast(): {
  toast: (props: ToastOptions) => string
  dismiss: (toastId: string) => void
  toasts: ToastOptions[]
} {
  const context = React.useContext(ToastContext)

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  return context
}

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed top-0 right-0 z-[100] flex flex-col gap-2 w-full max-w-[420px] p-4">
      {toasts.map(({ id, title, description, variant, ...props }) => (
        <div
          key={id}
          className={`group relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 shadow-md transition-all ${
            variant === "destructive"
              ? "border-destructive bg-destructive text-destructive-foreground"
              : "bg-background border-border"
          }`}
          {...props}
        >
          <div className="flex flex-col gap-1">
            {title && <p className="font-medium">{title}</p>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          <button
            className="inline-flex shrink-0 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none"
            onClick={() => dismiss(id!)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      ))}
    </div>
  )
} 