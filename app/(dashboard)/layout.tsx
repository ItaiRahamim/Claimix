import { redirect } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import type { UserRole } from "@/lib/types"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // DEMO MODE: skip auth and use importer role
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    return <AppShell role="importer">{children}</AppShell>
  }

  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const role = (user.user_metadata?.role as UserRole) ?? null
  if (!role) redirect("/login")

  return <AppShell role={role}>{children}</AppShell>
}
