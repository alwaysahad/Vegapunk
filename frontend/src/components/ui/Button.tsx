import type { ReactElement } from "react"

interface buttonProps {
  variant: "primary" | "secondary"
  size: "sm" | "md" | "lg"
  text: string
  startIcon?: ReactElement
  endIcon?: ReactElement
  onClick: () => void
}

const varientStyles = {
  "primary": "bg-purple-600 text-white",
  "secondary": "bg-purple-400 text-purple-600"
}

export const Button = (props: buttonProps) => {
  return <button className={varientStyles[props.variant]}>{props.text}</button>
}

<Button variant="primary" size="md" onClick={()=>{}} text={"adsasd"} />