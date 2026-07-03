type StatusMessageProps = {
  message: string
}

export function LoadingState({ message }: StatusMessageProps) {
  return (
    <div className="text-muted-foreground flex h-40 items-center justify-center text-sm">
      {message}
    </div>
  )
}

export function ErrorState({ message }: StatusMessageProps) {
  return (
    <div className="text-destructive flex h-40 items-center justify-center text-sm">
      {message}
    </div>
  )
}
