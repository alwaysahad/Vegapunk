import type { ButtonHTMLAttributes, ReactElement } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost"
  size?: "sm" | "md" | "lg"
  startIcon?: ReactElement
  endIcon?: ReactElement
}

const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-sm hover:shadow-md",
  secondary:
    "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 shadow-sm",
  ghost:
    "bg-transparent text-gray-700 hover:bg-gray-100",
}

const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
}

export function Button({
  variant = "primary",
  size = "md",
  startIcon,
  endIcon,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const classes = [
    "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:pointer-events-none",
    variantStyles[variant],
    sizeStyles[size],
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <button className={classes} {...rest}>
      {startIcon ? <span className="mr-2">{startIcon}</span> : null}
      {children}
      {endIcon ? <span className="ml-2">{endIcon}</span> : null}
    </button>
  )
}