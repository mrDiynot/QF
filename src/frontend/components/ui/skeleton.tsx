import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("shimmer rounded-lg bg-muted relative overflow-hidden", className)}
      {...props}
    />
  )
}

export { Skeleton }