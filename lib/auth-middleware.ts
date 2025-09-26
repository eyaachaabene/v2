import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

export interface TokenPayload {
  userId: string
  email: string
  role: string
}

export async function verifyToken(request: NextRequest): Promise<TokenPayload | null> {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null
    }

    const token = authHeader.substring(7)

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as TokenPayload

    return decoded
  } catch (error) {
    console.error("[v0] Token verification error:", error)
    return null
  }
}
