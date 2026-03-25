import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const PROTECTED_ADMIN_PATHS   = ['/admin']
const PROTECTED_ACCOUNT_PATHS = ['/account']

function isProtectedPath(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => pathname.startsWith(prefix))
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Refresh the Supabase session and get the current user.
  const { supabaseResponse, user } = await updateSession(request)

  // Redirect unauthenticated users away from protected routes.
  if (!user) {
    if (
      isProtectedPath(pathname, PROTECTED_ADMIN_PATHS) ||
      isProtectedPath(pathname, PROTECTED_ACCOUNT_PATHS)
    ) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Prevent authenticated users from accessing auth pages.
  if (user) {
    const authPaths = ['/login', '/register']
    if (authPaths.includes(pathname)) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (images, icons, etc.)
     * - api routes that don't need auth (webhooks)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)',
  ],
}
