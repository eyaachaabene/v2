import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { verifyToken } from "@/lib/auth-middleware"

export async function POST(request: NextRequest) {
  try {
    const token = await verifyToken(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const usersCollection = db.collection("users")

    // Mettre à jour isActive à false
    await usersCollection.updateOne(
      { _id: new ObjectId(token.userId) },
      { 
        $set: { 
          isActive: false,
          lastLogout: new Date()
        } 
      }
    )

    // Créer une réponse qui supprime le cookie d'authentification
    const response = NextResponse.json({ 
      message: "Logged out successfully" 
    })

    // Supprimer le cookie d'authentification
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expire immédiatement
      path: '/'
    })

    return response

  } catch (error) {
    console.error("[v0] Logout error:", error)
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 })
  }
}