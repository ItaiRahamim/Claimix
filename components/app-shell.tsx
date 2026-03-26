"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { FileText, PlusCircle, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import type { UserRole } from "@/lib/types"

const importerNav = [
  { label: "Claims", href: "/claims", icon: FileText },
  { label: "New Claim", href: "/new-claim", icon: PlusCircle },
]

const supplierNav = [
  { label: "Claims", href: "/claims", icon: FileText },
]

interface AppShellProps {
  children: React.ReactNode
  role: UserRole
}

export function AppShell({ children, role }: AppShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const navItems = role === "importer" ? importerNav : supplierNav

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Logo / Brand */}
            <span className="text-base font-semibold text-gray-900 tracking-tight">
              Claimix
            </span>

            {/* Nav */}
            <nav className="flex items-center gap-1">
              {navItems.map(({ label, href, icon: Icon }) => {
                const isActive = pathname === href || pathname.startsWith(href + "/")
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors",
                      isActive
                        ? "bg-gray-100 text-gray-900 font-medium"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Role badge */}
            <span
              className={cn(
                "text-xs font-medium px-2.5 py-1 rounded-full text-white",
                role === "importer" ? "bg-blue-600" : "bg-green-600"
              )}
            >
              {role === "importer" ? "Importer" : "Supplier"}
            </span>

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
