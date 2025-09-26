import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { getDatabase } from "@/lib/mongodb"
import type { User } from "@/lib/models/User"

export async function signup(
  request: NextRequest,
) {
  try {
    const { email, password, firstName, lastName, role, phone, location, interests } = await request.json()

    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()
    const usersCollection = db.collection<User>("users")

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const newUser: User = {
      email,
      password: hashedPassword,
      role,
      profile: {
        firstName,
        lastName,
        phone: phone || "",
        location: location || {
          governorate: "",
          city: "",
          coordinates: {
            lat: 0,
            lng: 0
          }
        },
        languages: ["en"],
        interests: interests || []
      },
      preferences: {
        notifications: {
          email: true,
          sms: true,
          push: true
        },
        language: "en",
        currency: "TND"
      },
      verification: {
        emailVerified: false,
        phoneVerified: false,
        identityVerified: false
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await usersCollection.insertOne(newUser)

    // Generate token
    const token = jwt.sign(
      { userId: result.insertedId, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    )

    // Remove password from response
    const { password: _, ...userResponse } = newUser

    return NextResponse.json({
      message: "User created successfully",
      user: { ...userResponse, _id: result.insertedId },
      token
    }, { status: 201 })

  } catch (error) {
    console.error("[v0] Signup error:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}

export async function login(
  request: NextRequest,
) {
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

    // Update last login
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          lastLogin: new Date(),
          updatedAt: new Date()
        }
      }
    )

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    )

    // Remove password from response
    const { password: _, ...userResponse } = user

    return NextResponse.json({
      message: "Login successful",
      user: userResponse,
      token
    })

  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Failed to login" }, { status: 500 })
  }
}