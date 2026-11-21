import LoginClient from './LoginForm'
import { isReservedTagId, normalizeTagId } from '@/lib/tag-id'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ tag_id?: string | string[] }>
}) {
  const params = await searchParams
  const normalized = normalizeTagId(params?.tag_id)
  const validTagId = normalized && !isReservedTagId(normalized) ? normalized : null

  return <LoginClient initialTagId={validTagId} />
}
