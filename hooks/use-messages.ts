"use client"

import { useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchMessages } from "@/lib/queries/messages"
import { MOCK_MESSAGES } from "@/lib/mock-data"

const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

export function useMessages(claimId: string) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ["messages", claimId],
    queryFn: DEMO
      ? () => Promise.resolve(MOCK_MESSAGES.filter((m) => m.claim_id === claimId))
      : () => fetchMessages(claimId),
    enabled: !!claimId,
  })

  // Realtime subscription — skipped in demo mode
  useEffect(() => {
    if (DEMO || !claimId) return
    let channel: ReturnType<ReturnType<typeof import("@/lib/supabase/client")["createClient"]>["channel"]>
    import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient()
      channel = supabase
        .channel(`messages-${claimId}`)
        .on("postgres_changes", {
          event: "INSERT",
          schema: "public",
          table: "claim_messages",
          filter: `claim_id=eq.${claimId}`,
        }, () => {
          queryClient.invalidateQueries({ queryKey: ["messages", claimId] })
        })
        .subscribe()
    })
    return () => { channel?.unsubscribe() }
  }, [claimId, queryClient])

  return query
}
