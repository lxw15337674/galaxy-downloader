"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const [mounted, setMounted] = useState(false)
  const { theme = "system" } = useTheme()
  const activeTheme = mounted ? theme : "system"

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Sonner
      theme={activeTheme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        duration: 2000,
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description:
            "group-[.toast]:text-muted-foreground group-[.toast]:max-w-[280px] group-[.toast]:overflow-hidden group-[.toast]:text-ellipsis group-[.toast]:whitespace-nowrap",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
