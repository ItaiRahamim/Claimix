"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) {
      toast.error(error.message)
    } else {
      router.push("/claims")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Claimix</h1>
          <p className="text-sm text-gray-500 mt-1">Claims Management System</p>
        </div>

        {DEMO && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4 pb-4 space-y-3">
              <p className="text-sm text-blue-700 font-medium">Demo Mode</p>
              <p className="text-xs text-blue-600">
                You are running in demo mode with mock data. No real authentication is required.
              </p>
              <Button
                className="w-full"
                onClick={() => router.push("/claims")}
              >
                Continue as Importer (Demo)
              </Button>
            </CardContent>
          </Card>
        )}

        {!DEMO && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Sign in</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in…" : "Sign in"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
