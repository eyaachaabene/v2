import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({
        error: "No authorization header",
        jwtSecret: process.env.JWT_SECRET ? "SET" : "NOT_SET",
        fallbackSecret: "fallback-secret"
      }, { status: 401 })
    }

    const tokenString = authHeader.split(" ")[1]
    
    try {
      const secret = process.env.JWT_SECRET || "fallback-secret"
      console.log("Using secret for verification:", secret)
      
      const decoded = jwt.verify(tokenString, secret)
      
      return NextResponse.json({
        success: true,
        tokenPayload: decoded,
        secretUsed: secret,
        jwtSecretSet: process.env.JWT_SECRET ? "YES" : "NO"
      })
    } catch (error: any) {
      return NextResponse.json({
        error: "Token verification failed",
        details: error.message,
        tokenPreview: tokenString.substring(0, 50) + "...",
        secretUsed: process.env.JWT_SECRET || "fallback-secret",
        jwtSecretSet: process.env.JWT_SECRET ? "YES" : "NO"
      }, { status: 401 })
    }
  } catch (error) {
    console.error("Auth test error:", error)
    return NextResponse.json({ error: "Test failed" }, { status: 500 })
  }
}