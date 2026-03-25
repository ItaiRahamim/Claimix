import { redirect } from "next/navigation"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { UserRole } from "@/lib/types"



export async function getUser(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserRole(supabase: SupabaseClient): Promise<UserRole | null> {
  const user = await getUser(supabase)
  return (user?.user_metadata?.role as UserRole) ?? null
}

export async function requireAuth(supabase: SupabaseClient) {
  const user = await getUser(supabase)
  if (!user) redirect("/login")
  return user
}

export async function requireRole(supabase: SupabaseClient, role: UserRole) {
  const userRole = await getUserRole(supabase)
  if (userRole !== role) redirect("/claims")
}
