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
  const role = user?.user_metadata?.role as UserRole

  if (role !== "importer") redirect("/claims")

  return <NewClaimForm />
}
