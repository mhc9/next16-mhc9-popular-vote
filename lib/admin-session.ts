import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secretKey = process.env.ADMIN_SESSION_SECRET || 'mhc9-admin-super-secret-key-for-dev'
const encodedKey = new TextEncoder().encode(secretKey)

export type AdminSessionPayload = {
  adminId: string
  username: string
  role: string
  expiresAt: Date
}

export async function encryptAdmin(payload: AdminSessionPayload) {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(encodedKey)
}

export async function decryptAdmin(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    })
    return payload as AdminSessionPayload
  } catch (error) {
    return null
  }
}

export async function createAdminSession(adminId: string, username: string, role: string) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day
  
  const session = await encryptAdmin({ adminId, username, role, expiresAt })
  
  const cookieStore = await cookies()
  cookieStore.set('admin_session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

export async function getAdminSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')?.value
  if (!session) return null
  return await decryptAdmin(session)
}

export async function deleteAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
}
