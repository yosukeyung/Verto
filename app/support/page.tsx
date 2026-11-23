import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { sanitizeReturnPath } from '@/lib/support'
import SupportForm from './SupportForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Support | Verto',
  description: 'Report an issue or request help with your Verto NFC tag.',
}

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string | string[] }>
}) {
  const params = await searchParams
  const returnTo = sanitizeReturnPath(params?.from)

  let initialEmail = ''

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user?.email) {
      initialEmail = user.email
    }
  } catch {
    // Public support page remains usable when unauthenticated
  }

  return <SupportForm initialEmail={initialEmail} returnTo={returnTo} />
}
