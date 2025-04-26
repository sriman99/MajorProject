import React from "react";

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export function Separator({
  className = "",
  orientation = "horizontal",
  ...props
}: SeparatorProps) {
  return (
    <div
      className={`
        ${orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]"}
        bg-gray-200 dark:bg-gray-700 ${className}
      `}
      {...props}
    />
  );
}
