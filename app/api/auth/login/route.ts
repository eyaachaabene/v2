import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { getDatabase } from "@/lib/mongodb"
import type { User } from "@/lib/models/User"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const db = await getDatabase()
    const usersCollection = db.collection<User>("users")

    // Find user by email
    const user = await usersCollection.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Update last login and set active status
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          lastLogin: new Date(),
          updatedAt: new Date(),
          isActive: true,
        },
      },
    )

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" },
    )

    // Remove password from response
    const { password: _, ...userResponse } = user

    // Create response with token cookie
    const response = NextResponse.json({
      message: "Login successful",
      user: userResponse,
      token,
    })

    // Set cookie for authentication
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    return response
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
