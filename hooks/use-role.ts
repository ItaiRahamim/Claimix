"use client"

import { useEffect, useState } from "react"
import type { UserRole } from "@/lib/types"
import { MOCK_USER_ID } from "@/lib/mock-data"

const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

export function useRole(): UserRole | null {
  const [role, setRole] = useState<UserRole | null>(DEMO ? "importer" : null)

  useEffect(() => {
    if (DEMO) return
    import("@/lib/supabase/client").then(({ createClient }) => {
      createClient().auth.getUser().then(({ data: { user } }) => {
        setRole((user?.user_metadata?.role as UserRole) ?? null)
      })
    })
  }, [])

  return role
}

export function useCurrentUser() {
  const [userId, setUserId] = useState<string | null>(DEMO ? MOCK_USER_ID : null)
  const [role, setRole] = useState<UserRole | null>(DEMO ? "importer" : null)

  useEffect(() => {
    if (DEMO) return
    import("@/lib/supabase/client").then(({ createClient }) => {
      createClient().auth.getUser().then(({ data: { user } }) => {
        setUserId(user?.id ?? null)
        setRole((user?.user_metadata?.role as UserRole) ?? null)
      })
    })
  }, [])

  return { userId, role }
}
