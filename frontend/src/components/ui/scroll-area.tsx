import * as React from "react"

type ScrollAreaProps = React.HTMLAttributes<HTMLDivElement> & {
  viewportRef?: React.RefObject<HTMLDivElement>;
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ children, className = "", viewportRef, ...props }, ref) => {
    return (
      <div 
        ref={ref} 
        className={`relative overflow-auto h-full ${className}`} 
        {...props}
      >
        <div 
          ref={viewportRef} 
          className="h-full w-full"
        >
          {children}
        </div>
      </div>
    )
  }
)
ScrollArea.displayName = "ScrollArea"

export { ScrollArea } 