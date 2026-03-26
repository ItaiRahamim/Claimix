"use client"

// Direct import is safe — "use client" guarantees server never runs this
import { useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
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

  // Fix: replaced the dynamic import() pattern with a direct import.
  // The old code did:
  //   import("@/lib/supabase/client").then(({ createClient }) => {
  //     channel = supabase.channel(...).subscribe()
  //   })
  //   return () => { channel?.unsubscribe() }   ← cleanup ran BEFORE
  //                                                Promise resolved, so
  //                                                channel was always
  //                                                undefined → subscription
  //                                                leaked → lock contention
  //
  // Now the client is imported at module level (safe in "use client" files)
  // so the channel is available synchronously and cleanup always works.
  useEffect(() => {
    if (DEMO || !claimId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`messages-${claimId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "claim_messages",
          filter: `claim_id=eq.${claimId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["messages", claimId] })
        }
      )
      .subscribe()

    // Cleanup is now guaranteed to call unsubscribe on the correct reference
    return () => {
      channel.unsubscribe()
    }
  }, [claimId, queryClient])

  return query
}
