import { redirect } from "next/navigation"
import { NewClaimForm } from "@/components/new-claim-form"
import type { UserRole } from "@/lib/types"

export default async function NewClaimPage() {
  // DEMO MODE
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    return <NewClaimForm />
  }

  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  // Bug fix: default to "importer" (same as layout) so a user whose
  // metadata.role is not yet set is not permanently redirected away.
  const role = (user.user_metadata?.role as UserRole) ?? "importer"
  if (role !== "importer") redirect("/claims")

  return <NewClaimForm />
}
