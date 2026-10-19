'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { usePathname } from 'next/navigation'

// Dark mode is scoped to authenticated routes. Public pages (landing, login,
// finder view at /t/[id]) are forced light so a dark preference never leaks there.
const THEMED_PREFIXES = ['/dashboard']

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/'
  const isThemedRoute = THEMED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      forcedTheme={isThemedRoute ? undefined : 'light'}
    >
      {children}
    </NextThemesProvider>
  )
}
