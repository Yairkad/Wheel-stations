import bcrypt from 'bcryptjs'

const BCRYPT_ROUNDS = 12

/** Returns true if the stored value looks like a bcrypt hash */
function isBcryptHash(stored: string): boolean {
  return stored.startsWith('$2a$') || stored.startsWith('$2b$') || stored.startsWith('$2y$')
}

/**
 * Verifies a plain-text password against a stored value.
 * Handles both bcrypt hashes and legacy plain-text passwords.
 * When a plain-text match is found, returns the new bcrypt hash so the caller
 * can migrate the stored value — without a separate DB read.
 */
export async function verifyPassword(
  plaintext: string,
  stored: string
): Promise<{ valid: boolean; newHash?: string }> {
  if (isBcryptHash(stored)) {
    const valid = await bcrypt.compare(plaintext, stored)
    return { valid }
  }
  // Legacy plain-text path — verify and provide migration hash
  if (plaintext === stored) {
    const newHash = await bcrypt.hash(plaintext, BCRYPT_ROUNDS)
    return { valid: true, newHash }
  }
  return { valid: false }
}

/** Hashes a new password with bcrypt */
export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, BCRYPT_ROUNDS)
}
