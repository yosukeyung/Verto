import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import RegisterClient from './RegisterForm'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ tag_id?: string }>
}) {
  const params = await searchParams
  const tag_id = params?.tag_id

  if (tag_id) {
    const supabase = await createServiceClient()
    const { data } = await supabase
      .from('tags')
      .select('tag_id')
      .eq('tag_id', tag_id)
      .single()

    if (!data) {
      notFound()
    }
  }

  return <RegisterClient />
}
