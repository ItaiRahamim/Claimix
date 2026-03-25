import { cn } from "@/lib/utils"
import type { ClaimStatus } from "@/lib/types"

const statusStyles: Record<ClaimStatus, string> = {
  Open: "bg-blue-100 text-blue-700 border-blue-200",
  "In Review": "bg-yellow-100 text-yellow-800 border-yellow-200",
  Resolved: "bg-green-100 text-green-800 border-green-200",
}

export function ClaimStatusBadge({ status }: { status: ClaimStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        statusStyles[status]
      )}
    >
      {status}
    </span>
  )
}
