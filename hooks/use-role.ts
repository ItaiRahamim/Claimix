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
      createClient()
        .auth.getUser()
        .then(({ data: { user } }) => {
          setRole((user?.user_metadata?.role as UserRole) ?? "importer")
        })
    })
  }, [])

  return role
}

export function useCurrentUser() {
  const [userId, setUserId] = useState<string | null>(DEMO ? MOCK_USER_ID : null)
  const [role, setRole] = useState<UserRole | null>(DEMO ? "importer" : null)
  // Bug fix: track loading so callers don't send writes with userId=""
  const [isLoading, setIsLoading] = useState(!DEMO)

  useEffect(() => {
    if (DEMO) return
    import("@/lib/supabase/client").then(({ createClient }) => {
      createClient()
        .auth.getUser()
        .then(({ data: { user } }) => {
          setUserId(user?.id ?? null)
          setRole((user?.user_metadata?.role as UserRole) ?? "importer")
          setIsLoading(false)
        })
    })
  }, [])

  return { userId, role, isLoading }
}
