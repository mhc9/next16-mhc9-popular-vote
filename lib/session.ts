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
    return null
  }
}

export async function createSession(voterId: string, phoneNumber: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  
  const session = await encrypt({ voterId, phoneNumber, expiresAt })
  
  const cookieStore = await cookies()
  cookieStore.set('session', session, {
    httpOnly: true,
    // Fix: Only use secure cookies if explicitly enabled, because testing/deploying on HTTP 
    // (like an intranet IP) with NODE_ENV=production causes the browser to reject the cookie!
    secure: process.env.HTTPS_ENABLED === 'true',
    expires: expiresAt,
    sameSite: 'lax',
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
    secure: process.env.HTTPS_ENABLED === 'true',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
  
  return payload
}

export async function getSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value
  
  if (!session) {
    return null
  }
  
  const decrypted = await decrypt(session)
  if (!decrypted) {
    return null
  }
  
  return decrypted
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}
