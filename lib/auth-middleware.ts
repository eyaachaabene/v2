import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

export interface TokenPayload {
  userId: string
  email: string
  role: string
}

export async function verifyToken(request: NextRequest): Promise<TokenPayload | null> {
  try {
    let token: string | null = null

    // First, try to get token from Authorization header
    const authHeader = request.headers.get("authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7)
    }

    // If no Authorization header, try to get token from cookies
    if (!token) {
      token = request.cookies.get("auth-token")?.value || request.cookies.get("auth_token")?.value || null
    }

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as TokenPayload

    return decoded
  } catch (error) {
    console.error("[v0] Token verification error:", error)
    return null
  }
}

// Auth middleware for API routes
export async function authMiddleware(request: NextRequest): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    const tokenPayload = await verifyToken(request)
    
    if (!tokenPayload) {
      return { success: false, error: 'Authentication required' }
    }

    return { success: true, userId: tokenPayload.userId }
  } catch (error) {
    console.error('Auth middleware error:', error)
    return { success: false, error: 'Authentication failed' }
  }
}
