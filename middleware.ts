import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Routes qui nécessitent une authentification
  const protectedRoutes = ['/dashboard', '/marketplace', '/iot', '/opportunities', '/community', '/messages']
  
  const currentPath = request.nextUrl.pathname
  
  // Vérifier si la route actuelle est protégée
  const isProtectedRoute = protectedRoutes.some(route => currentPath.startsWith(route))
  
  if (isProtectedRoute) {
    // Vérifier le token d'authentification
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')
                  
    if (!token) {
      // Rediriger vers la page de connexion si pas de token
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', currentPath)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|login|signup|forgot-password|$).*)',
  ],
}