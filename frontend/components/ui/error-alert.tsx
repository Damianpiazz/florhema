'use client'

interface ErrorAlertProps {
  message: string | null | undefined
  className?: string
}

export function ErrorAlert({ message, className }: ErrorAlertProps) {
  if (!message) return null
  return (
    <div
      role="alert"
      className={`text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-2 text-center${className ? ` ${className}` : ''}`}
    >
      {message}
    </div>
  )
}
