import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import jwt from "jsonwebtoken"

// GET - Récupérer une ressource spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase()
    
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid resource ID" },
        { status: 400 }
      )
    }

    const resource = await db.collection("resources").findOne({
      _id: new ObjectId(params.id)
    })

    if (!resource) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ resource })
  } catch (error) {
    console.error("Error fetching resource:", error)
    return NextResponse.json(
      { error: "Failed to fetch resource" },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour une ressource
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      )
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const userId = decoded.userId

    const { db } = await connectToDatabase()
    
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid resource ID" },
        { status: 400 }
      )
    }

    // Vérifier que la ressource existe et appartient à l'utilisateur
    const existingResource = await db.collection("resources").findOne({
      _id: new ObjectId(params.id),
      supplierId: userId
    })

    if (!existingResource) {
      return NextResponse.json(
        { error: "Resource not found or you don't have permission to update it" },
        { status: 404 }
      )
    }

    const updateData = await request.json()
    
    // Ajouter les champs de métadonnées
    const resourceUpdate = {
      ...updateData,
      updatedAt: new Date(),
      updatedBy: userId
    }

    // Mettre à jour la ressource
    const result = await db.collection("resources").updateOne(
      { _id: new ObjectId(params.id), supplierId: userId },
      { $set: resourceUpdate }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Resource not found or you don't have permission to update it" },
        { status: 404 }
      )
    }

    // Récupérer la ressource mise à jour
    const updatedResource = await db.collection("resources").findOne({
      _id: new ObjectId(params.id)
    })

    return NextResponse.json({
      message: "Resource updated successfully",
      resource: updatedResource
    })
  } catch (error) {
    console.error("Error updating resource:", error)
    return NextResponse.json(
      { error: "Failed to update resource" },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une ressource
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      )
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const userId = decoded.userId

    const { db } = await connectToDatabase()
    
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid resource ID" },
        { status: 400 }
      )
    }

    // Vérifier que la ressource existe et appartient à l'utilisateur
    const existingResource = await db.collection("resources").findOne({
      _id: new ObjectId(params.id),
      supplierId: userId
    })

    if (!existingResource) {
      return NextResponse.json(
        { error: "Resource not found or you don't have permission to delete it" },
        { status: 404 }
      )
    }

    // Supprimer la ressource
    const result = await db.collection("resources").deleteOne({
      _id: new ObjectId(params.id),
      supplierId: userId
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Resource not found or you don't have permission to delete it" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: "Resource deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting resource:", error)
    return NextResponse.json(
      { error: "Failed to delete resource" },
      { status: 500 }
    )
  }
}