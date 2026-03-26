import { redirect } from "next/navigation"

export const runtime = 'edge'

export default async function RootPage() {
  // DEMO MODE
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    redirect("/claims")
  }

  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect("/claims")
  } else {
    redirect("/login")
  }
}
