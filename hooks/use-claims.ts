"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchClaims, fetchClaim } from "@/lib/queries/claims"
import { MOCK_CLAIMS } from "@/lib/mock-data"

const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

export function useClaims() {
  return useQuery({
    queryKey: ["claims"],
    queryFn: DEMO ? () => Promise.resolve(MOCK_CLAIMS) : fetchClaims,
  })
}

export function useClaim(claimId: string) {
  return useQuery({
    queryKey: ["claim", claimId],
    queryFn: DEMO
      ? () => Promise.resolve(MOCK_CLAIMS.find((c) => c.claim_id === claimId)!)
      : () => fetchClaim(claimId),
    enabled: !!claimId,
  })
}
