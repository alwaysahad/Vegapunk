import type { PropsWithChildren } from "react"

export function Card({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={["rounded-xl border border-gray-200 bg-white/80 backdrop-blur shadow-sm transition-shadow hover:shadow-md", className].join(" ")}>{children}</div>
  )
}

export function CardHeader({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return <div className={["px-5 py-4 border-b border-gray-200", className].join(" ")}>{children}</div>
}

export function CardContent({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return <div className={["px-5 py-4", className].join(" ")}>{children}</div>
}

export function CardFooter({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return <div className={["px-5 py-4 border-t border-gray-200", className].join(" ")}>{children}</div>
}


