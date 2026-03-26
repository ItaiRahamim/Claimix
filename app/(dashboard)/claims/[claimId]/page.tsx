import { notFound } from "next/navigation"
import { ClaimDetailPage } from "@/components/claim-detail-page"
import { MOCK_CLAIMS } from "@/lib/mock-data"
import type { UserRole } from "@/lib/types"

export const runtime = 'edge'

interface PageProps {
  params: Promise<{ claimId: string }>
}

export default async function ClaimPage({ params }: PageProps) {
  const { claimId } = await params

  // DEMO MODE
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    const exists = MOCK_CLAIMS.some((c) => c.claim_id === claimId)
    if (!exists) notFound()
    return <ClaimDetailPage claimId={claimId} role="importer" />
  }

  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const role = (user?.user_metadata?.role as UserRole) ?? "supplier"

  const { data: claim } = await supabase
    .from("claims")
    .select("claim_id")
    .eq("claim_id", claimId)
    .single()

  if (!claim) notFound()

  return <ClaimDetailPage claimId={claimId} role={role} />
}
