import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secretKey = process.env.SESSION_SECRET || 'mhc9-super-secret-key-for-dev'
const encodedKey = new TextEncoder().encode(secretKey)

const adminSecretKey = process.env.ADMIN_SESSION_SECRET || 'mhc9-admin-super-secret-key-for-dev'
const encodedAdminKey = new TextEncoder().encode(adminSecretKey)

export async function middleware(request: NextRequest) {
  // 1. Check Voter Session for /vote/cast
  if (request.nextUrl.pathname.startsWith('/vote/cast')) {
    // Bypass middleware for Server Actions (POST requests). 
    // The Server Action (castVoteAction) performs its own session validation via getSession().
    if (request.method === 'POST' || request.headers.has('next-action')) {
      return NextResponse.next()
    }

    const session = request.cookies.get('session')?.value
    if (!session) {
      const url = new URL('/vote/register', request.url)
      const eventId = request.nextUrl.searchParams.get('eventId')
      if (eventId) {
        url.searchParams.set('eventId', eventId)
      }
      return NextResponse.redirect(url)
    }

    try {
      await jwtVerify(session, encodedKey, { algorithms: ['HS256'] })
    } catch (err) {
      const url = new URL('/vote/register', request.url)
      const eventId = request.nextUrl.searchParams.get('eventId')
      if (eventId) {
        url.searchParams.set('eventId', eventId)
      }
      return NextResponse.redirect(url)
    }
  }

  // 2. Check Admin Session for /admin (but exclude /admin/login)
  if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) {
    const adminSession = request.cookies.get('admin_session')?.value
    if (!adminSession) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      await jwtVerify(adminSession, encodedAdminKey, { algorithms: ['HS256'] })
    } catch (err) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // 3. Redirect logged in admin away from /admin/login
  if (request.nextUrl.pathname.startsWith('/admin/login')) {
    const adminSession = request.cookies.get('admin_session')?.value
    if (adminSession) {
      try {
        await jwtVerify(adminSession, encodedAdminKey, { algorithms: ['HS256'] })
        return NextResponse.redirect(new URL('/admin', request.url))
      } catch (err) {
        // Invalid session, let them see the login page
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/vote/cast/:path*', '/admin/:path*'],
}
