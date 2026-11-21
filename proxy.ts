import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware'
import { createClient } from '@supabase/supabase-js'
import { isReservedTagId, normalizeTagId } from '@/lib/tag-id'

function applyResponseCookies(source: NextResponse, target: NextResponse): NextResponse {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie)
  })
  return target
}

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // ─── /t/[id] — NFC tap intercept ──────────────────────────────────────────
  // Handled server-side per RULES.md: never rely on client-side useEffect.
  if (pathname === '/t' || pathname.startsWith('/t/')) {
    if (pathname === '/t' || pathname === '/t/') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    const match = pathname.match(/^\/t\/([^/]+)$/)
    if (!match) {
      return NextResponse.next()
    }

    let decoded = ''
    try {
      decoded = decodeURIComponent(match[1])
    } catch {
      return NextResponse.rewrite(new URL('/t/invalid/not-found', request.url))
    }

    const tagId = normalizeTagId(decoded)
    if (!tagId) {
      return NextResponse.rewrite(new URL('/t/invalid/not-found', request.url))
    }

    // Service-role client: bypasses RLS for unauthenticated NFC taps (read-only minimal columns).
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: tag, error } = await supabase
      .from('tags')
      .select('tag_id, owner_id')
      .eq('tag_id', tagId)
      .maybeSingle()

    // Tag does not exist in DB — render the fallback page.
    if (error || !tag) {
      return NextResponse.rewrite(
        new URL(`/t/${encodeURIComponent(tagId)}/not-found`, request.url)
      )
    }

    // Tag exists but unclaimed (no owner).
    if (!tag.owner_id) {
      // Super admin tag (000) is reserved — never expose register page for it.
      if (isReservedTagId(tagId)) {
        return NextResponse.redirect(new URL('/', request.url))
      }

      // Check caller session via cookie-aware middleware client (never cookie-less service client).
      const { supabase: authSupabase, supabaseResponse } = await createMiddlewareClient(request)
      const { data: { user } } = await authSupabase.auth.getUser()

      const redirectUrl = user
        ? new URL(`/dashboard/claim?tag_id=${encodeURIComponent(tagId)}`, request.url)
        : new URL(`/register?tag_id=${encodeURIComponent(tagId)}`, request.url)

      return applyResponseCookies(supabaseResponse, NextResponse.redirect(redirectUrl))
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
    const tagId = normalizeTagId(searchParams.get('tag_id'))
    if (!tagId || isReservedTagId(tagId)) {
      return applyResponseCookies(
        supabaseResponse,
        NextResponse.redirect(new URL('/', request.url))
      )
    }

    // Logged-in user visiting /register with a tag_id → dashboard claim flow.
    if (user) {
      return applyResponseCookies(
        supabaseResponse,
        NextResponse.redirect(
          new URL(`/dashboard/claim?tag_id=${encodeURIComponent(tagId)}`, request.url)
        )
      )
    }

    return supabaseResponse
  }

  // ─── /dashboard — auth guard ───────────────────────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      return applyResponseCookies(
        supabaseResponse,
        NextResponse.redirect(new URL('/login', request.url))
      )
    }
    return supabaseResponse
  }

  // ─── /login — redirect already-logged-in users to dashboard ───────────────
  if (pathname === '/login' && user) {
    return applyResponseCookies(
      supabaseResponse,
      NextResponse.redirect(new URL('/dashboard', request.url))
    )
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
