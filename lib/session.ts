import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secretKey = process.env.SESSION_SECRET || 'mhc9-super-secret-key-for-dev'
const encodedKey = new TextEncoder().encode(secretKey)

export type SessionPayload = {
  voterId: string
  phoneNumber: string
  expiresAt: Date
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey)
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    })
    return payload as SessionPayload
  } catch (error) {
    console.error('[decrypt] failed:', error)
    return null
  }
}

export async function createSession(voterId: string, phoneNumber: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  
  const session = await encrypt({ voterId, phoneNumber, expiresAt })
  
  const cookieStore = await cookies()
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  })
}

export async function updateSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value
  const payload = await decrypt(session)
 
  if (!session || !payload) {
    return null
  }
 
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  })
  
  return payload
}

export async function getSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value
  
  if (!session) {
    console.log('[getSession] raw cookie is MISSING or EMPTY')
    return null
  }
  
  const decrypted = await decrypt(session)
  if (!decrypted) {
    console.log('[getSession] decrypt failed for cookie:', session)
    return null
  }
  
  return decrypted
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}
