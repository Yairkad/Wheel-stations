import { createClient } from '@supabase/supabase-js'
import type { AuthenticatorTransportFuture } from '@simplewebauthn/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export function getRpConfig() {
  const rpID = process.env.NEXT_PUBLIC_RP_ID || 'localhost'
  const origin =
    process.env.NEXT_PUBLIC_WEBAUTHN_ORIGIN ??
    (rpID === 'localhost' ? 'http://localhost:3000' : `https://${rpID}`)
  return { rpName: 'Wheels App', rpID, origin }
}

/** Uint8Array (COSE public key) → base64url string for DB storage */
export function encodePublicKey(key: Uint8Array): string {
  return Buffer.from(key).toString('base64url')
}

/** base64url string from DB → Uint8Array<ArrayBuffer> for @simplewebauthn/server */
export function decodePublicKey(encoded: string): Uint8Array<ArrayBuffer> {
  const buf = Buffer.from(encoded, 'base64url')
  const ab = new ArrayBuffer(buf.length)
  new Uint8Array(ab).set(buf)
  return new Uint8Array(ab)
}

export interface StoredCredential {
  credential_id: string
  public_key: string
  counter: number
  transports: AuthenticatorTransportFuture[] | null
}

/** Insert a challenge, cleaning expired ones first */
export async function storeChallenge({
  challenge,
  type,
  userId,
  phone,
}: {
  challenge: string
  type: 'registration' | 'authentication'
  userId?: string
  phone?: string
}) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  await supabase.rpc('cleanup_expired_challenges')

  const { error } = await supabase.from('webauthn_challenges').insert({
    challenge,
    type,
    user_id: userId ?? null,
    phone: phone ?? null,
    expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  })
  if (error) throw new Error(`Failed to store challenge: ${error.message}`)
}

/** Read + delete a challenge in one step (prevents replay) */
export async function consumeChallenge(
  challenge: string,
  type: 'registration' | 'authentication'
): Promise<{ id: string; user_id: string | null; phone: string | null; challenge: string } | null> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const { data } = await supabase
    .from('webauthn_challenges')
    .select('id, user_id, phone, challenge')
    .eq('challenge', challenge)
    .eq('type', type)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!data) return null

  await supabase.from('webauthn_challenges').delete().eq('id', data.id)

  return data as { id: string; user_id: string | null; phone: string | null; challenge: string }
}

/** All active credentials for a user */
export async function getUserCredentials(userId: string): Promise<StoredCredential[]> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const { data } = await supabase
    .from('webauthn_credentials')
    .select('credential_id, public_key, counter, transports')
    .eq('user_id', userId)
  return (data ?? []) as StoredCredential[]
}

/** Single credential + owner user_id, looked up by credentialId */
export async function getCredentialById(
  credentialId: string
): Promise<(StoredCredential & { user_id: string }) | null> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const { data } = await supabase
    .from('webauthn_credentials')
    .select('credential_id, public_key, counter, transports, user_id')
    .eq('credential_id', credentialId)
    .single()
  return data as (StoredCredential & { user_id: string }) | null
}

export async function saveCredential({
  userId,
  credentialId,
  publicKey,
  counter,
  deviceType,
  backedUp,
  transports,
  friendlyName,
}: {
  userId: string
  credentialId: string
  publicKey: string
  counter: number
  deviceType: string
  backedUp: boolean
  transports?: AuthenticatorTransportFuture[]
  friendlyName?: string
}) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const { error } = await supabase.from('webauthn_credentials').insert({
    user_id: userId,
    credential_id: credentialId,
    public_key: publicKey,
    counter,
    device_type: deviceType,
    backed_up: backedUp,
    transports: transports ?? null,
    friendly_name: friendlyName ?? null,
  })
  if (error) throw new Error(`Failed to save credential: ${error.message}`)
}

export async function updateCredentialCounter(credentialId: string, counter: number) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  await supabase
    .from('webauthn_credentials')
    .update({ counter, last_used_at: new Date().toISOString() })
    .eq('credential_id', credentialId)
}
