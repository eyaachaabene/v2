import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { verifyToken } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  try {
    const token = await verifyToken(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const usersCollection = db.collection("users")

    const user = await usersCollection.findOne(
      { _id: new ObjectId(token.userId) },
      { projection: { password: 0, verification: 0 } }
    )

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error("[v0] Get profile error:", error)
    return NextResponse.json({ error: "Failed to get profile" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = await verifyToken(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profileData = await request.json()
    const db = await getDatabase()
    const usersCollection = db.collection("users")

    // Mettre à jour le profil utilisateur
    const updateData = {
      ...profileData,
      updatedAt: new Date()
    }

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(token.userId) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Récupérer le profil mis à jour
    const updatedUser = await usersCollection.findOne(
      { _id: new ObjectId(token.userId) },
      { projection: { password: 0, verification: 0 } }
    )

    return NextResponse.json({ 
      message: "Profile updated successfully",
      user: updatedUser
    })

  } catch (error) {
    console.error("[v0] Update profile error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}