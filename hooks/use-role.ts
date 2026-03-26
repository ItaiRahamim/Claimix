"use client"

// Direct import is safe — this file is client-only ("use client")
// so Next.js never executes it on the server.
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { UserRole } from "@/lib/types"
import { MOCK_USER_ID } from "@/lib/mock-data"

const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

export function useRole(): UserRole | null {
  const [role, setRole] = useState<UserRole | null>(DEMO ? "importer" : null)

  useEffect(() => {
    if (DEMO) return
    // getSession() reads from localStorage — no network call, no lock
    createClient()
      .auth.getSession()
      .then(({ data: { session } }) => {
        setRole((session?.user?.user_metadata?.role as UserRole) ?? "importer")
      })
      .catch(() => setRole("importer"))
  }, [])

  return role
}

export function useCurrentUser() {
  const [userId, setUserId] = useState<string | null>(DEMO ? MOCK_USER_ID : null)
  const [role, setRole] = useState<UserRole | null>(DEMO ? "importer" : null)
  // isLoading starts true in production so callers wait for real userId
  const [isLoading, setIsLoading] = useState(!DEMO)

  useEffect(() => {
    if (DEMO) return

    // Fix 1: use getSession() instead of getUser()
    //   getUser() makes a network request and acquires a mutex lock.
    //   Concurrent calls (React StrictMode double-invoke, fast nav) cause
    //   the "Lock was not released within 5000ms" error.
    //   getSession() reads from localStorage — instant, no lock.
    //
    // Fix 2: always call setIsLoading(false) in finally
    //   Without this, any rejection leaves isLoading=true forever,
    //   which keeps the page on the loading skeleton indefinitely.
    createClient()
      .auth.getSession()
      .then(({ data: { session } }) => {
        setUserId(session?.user?.id ?? null)
        setRole((session?.user?.user_metadata?.role as UserRole) ?? "importer")
      })
      .catch(() => {
        // Auth error — default to importer so the UI isn't blocked
        setRole("importer")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, []) // empty array — run once on mount only

  return { userId, role, isLoading }
}
