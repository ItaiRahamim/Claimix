import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { NewClaimForm } from "@/components/new-claim-form"
import type { UserRole } from "@/lib/types"

export default async function NewClaimPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.user_metadata?.role as UserRole

  if (role !== "importer") redirect("/claims")

  return <NewClaimForm />
}
