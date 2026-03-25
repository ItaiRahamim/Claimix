"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchDocuments } from "@/lib/queries/documents"
import { MOCK_DOCUMENTS } from "@/lib/mock-data"

const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

export function useDocuments(claimId: string) {
  return useQuery({
    queryKey: ["documents", claimId],
    queryFn: DEMO
      ? () => Promise.resolve(MOCK_DOCUMENTS.filter((d) => d.claim_id === claimId))
      : () => fetchDocuments(claimId),
    enabled: !!claimId,
  })
}
