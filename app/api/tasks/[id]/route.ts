import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth-middleware"
import { ObjectId } from "mongodb"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await verifyToken(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { db } = await connectToDatabase()

    const updateData = {
      ...body,
      updatedAt: new Date(),
    }

    // If marking as completed, add completion timestamp
    if (body.status === "completed") {
      updateData.completedAt = new Date()
    }

    await db.collection("tasks").updateOne(
      {
        _id: new ObjectId(params.id),
        farmerId: new ObjectId(token.userId),
      },
      { $set: updateData },
    )

    return NextResponse.json({
      message: "Task updated successfully",
    })
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await verifyToken(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    await db.collection("tasks").deleteOne({
      _id: new ObjectId(params.id),
      farmerId: new ObjectId(token.userId),
    })

    return NextResponse.json({
      message: "Task deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
  }
}
