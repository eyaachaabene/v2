import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { getDatabase } from "@/lib/mongodb"
import type { User } from "@/lib/models/User"

export async function POST(request: NextRequest) {
  try {
    const { email, password, role, profile } = await request.json()

    // Validate required fields
    if (!email || !password || !role || !profile) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()
    const usersCollection = db.collection<User>("users")

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user document
    const newUser: User = {
      email,
      password: hashedPassword,
      role,
      profile: {
        ...profile,
        languages: profile.languages || ["Arabic"],
      },
      preferences: {
        notifications: {
          email: true,
          sms: true,
          push: true,
        },
        language: "Arabic",
        currency: "TND",
      },
      verification: {
        emailVerified: false,
        phoneVerified: false,
        identityVerified: false,
        farmVerified: role === "farmer" ? false : undefined,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    }

    // Insert user
    const result = await usersCollection.insertOne(newUser)

    // Generate JWT token
    const token = jwt.sign({ userId: result.insertedId, email, role }, process.env.JWT_SECRET || "fallback-secret", {
      expiresIn: "7d",
    })

    // Remove password from response
    const { password: _, ...userResponse } = newUser

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: { ...userResponse, _id: result.insertedId },
        token,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
