import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'
import type { Database, TagRow } from '@/types/database'

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // ─── /t/[id] — NFC tap intercept ──────────────────────────────────────────
  // Handled server-side per RULES.md: never rely on client-side useEffect.
  if (pathname.startsWith('/t/')) {
    const tagId = pathname.split('/t/')[1]?.trim()

    if (!tagId) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Service-role client: bypasses RLS for unauthenticated NFC taps.
    // READ-ONLY here — no writes performed.
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: () => {},
        },
      }
    )

    const { data, error } = await supabase
      .from('tags')
      .select('tag_id, owner_id, active_mode, metadata, updated_at')
      .eq('tag_id', tagId)
      .single()

    const tag = data as TagRow | null

    // Tag does not exist in DB — render the fallback page.
    if (error || !tag) {
      return NextResponse.rewrite(new URL(`/t/${tagId}/not-found`, request.url))
    }

    // Tag exists but unclaimed (no owner).
    if (!tag.owner_id) {
      // Super admin tag (000) is reserved — never expose register page for it.
      if (tagId === '000') {
        return NextResponse.redirect(new URL('/', request.url))
      }

      // Check if a logged-in user is tapping an unclaimed tag (multi-tag claim).
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Redirect to dashboard claim flow to bind tag to existing account.
        return NextResponse.redirect(
          new URL(`/dashboard/claim?tag_id=${tagId}`, request.url)
        )
      }

      // Unauthenticated tap on unclaimed tag — invite-only registration.
      return NextResponse.redirect(
        new URL(`/register?tag_id=${tagId}`, request.url)
      )
    }

    // Tag is claimed and configured — let the /t/[id] page render SSR.
    return NextResponse.next()
  }

  // ─── Session refresh for all other routes ─────────────────────────────────
  // Required by @supabase/ssr to keep session tokens fresh on every request.
  const { supabase, supabaseResponse } = await createMiddlewareClient(request)
  const { data: { user } } = await supabase.auth.getUser()

  // ─── /register — invite-only guard ────────────────────────────────────────
  // Accessing /register without a valid tag_id param redirects to landing page.
  if (pathname === '/register') {
    const tagId = searchParams.get('tag_id')
    if (!tagId) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Logged-in user visiting /register with a tag_id → dashboard claim flow.
    if (user) {
      return NextResponse.redirect(
        new URL(`/dashboard/claim?tag_id=${tagId}`, request.url)
      )
    }

    return supabaseResponse
  }

  // ─── /dashboard — auth guard ───────────────────────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return supabaseResponse
  }

  // ─── /login — redirect already-logged-in users to dashboard ───────────────
  if (pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static assets)
     * - _next/image (Next.js image optimizer)
     * - favicon.ico
     * - Public assets (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
