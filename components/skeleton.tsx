import { HamburgerIcon } from "lucide-react"

export function SkeletonCard() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-bounce">
          <HamburgerIcon className="h-24 w-24 text-primary animate-pulse" />
        </div>
        <p className="text-lg font-medium text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
