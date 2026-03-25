import { format } from "date-fns"
import { Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ClaimOverviewBlockProps {
  summary: string | null
  updatedAt: string | null
}

export function ClaimOverviewBlock({ summary, updatedAt }: ClaimOverviewBlockProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-500" />
          Dynamic Claim Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {summary ? (
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{summary}</p>
        ) : (
          <p className="text-sm text-gray-400 italic">
            AI summary not yet generated. Check back after the nightly update.
          </p>
        )}
        {updatedAt && (
          <p className="text-xs text-gray-400">
            Last updated: {format(new Date(updatedAt), "MMM d, yyyy 'at' HH:mm")}
          </p>
        )}
        <p className="text-[10px] text-gray-300 border-t pt-2">
          This overview is generated once daily by an automated AI process analyzing the full claim history.
        </p>
      </CardContent>
    </Card>
  )
}
