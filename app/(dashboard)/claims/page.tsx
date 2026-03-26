import { ClaimsListPage } from "@/components/claims-list-page"
import { MOCK_CLAIMS } from "@/lib/mock-data"
import type { Claim, UserRole } from "@/lib/types"

export default async function ClaimsPage() {
  // DEMO MODE
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    return <ClaimsListPage claims={MOCK_CLAIMS} role="importer" />
  }

  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()

  const { data: claims } = await supabase
    .from("claims")
    .select("*")
    .order("created_at", { ascending: false })

  const { data: { user } } = await supabase.auth.getUser()
  // Bug fix: default consistent with layout.tsx ("importer") so the
  // correct nav items and UI labels appear before metadata is set.
  const role = (user?.user_metadata?.role as UserRole) ?? "importer"

  return (
    <ClaimsListPage
      claims={(claims as Claim[]) ?? []}
      role={role}
    />
  )
}
