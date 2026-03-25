import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // DEMO MODE: bypass all auth checks — remove when connecting Supabase
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    const { pathname } = request.nextUrl
    // Redirect root and /login straight to /claims
    if (pathname === "/" || pathname === "/login") {
      const url = request.nextUrl.clone()
      url.pathname = "/claims"
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // --- Production auth (re-enable when Supabase is wired up) ---
  const { createServerClient } = await import("@supabase/ssr")
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  const isProtected = pathname.startsWith("/claims") || pathname.startsWith("/new-claim")
  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/login"
    return NextResponse.redirect(loginUrl)
  }
  if (pathname === "/login" && user) {
    const claimsUrl = request.nextUrl.clone()
    claimsUrl.pathname = "/claims"
    return NextResponse.redirect(claimsUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
