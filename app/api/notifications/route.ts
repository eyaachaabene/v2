import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth-middleware"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const token = await verifyToken(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const unreadOnly = searchParams.get("unreadOnly") === "true"

    const { db } = await connectToDatabase()

    // Build filter
    const filter: any = { recipientId: new ObjectId(token.userId) }
    if (unreadOnly) {
      filter.read = false
    }

    const notifications = await db
      .collection("notifications")
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()

    const unreadCount = await db.collection("notifications").countDocuments({
      recipientId: new ObjectId(token.userId),
      read: false,
    })

    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = await verifyToken(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { notificationIds, markAsRead } = body

    const { db } = await connectToDatabase()

    // Mark notifications as read/unread
    await db.collection("notifications").updateMany(
      {
        _id: { $in: notificationIds.map((id: string) => new ObjectId(id)) },
        recipientId: new ObjectId(token.userId),
      },
      {
        $set: { read: markAsRead, readAt: markAsRead ? new Date() : null },
      }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating notifications:", error)
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = await verifyToken(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get("id")

    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID required" },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Delete notification (only if it belongs to the user)
    const result = await db.collection("notifications").deleteOne({
      _id: new ObjectId(notificationId),
      recipientId: new ObjectId(token.userId),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Notification not found or unauthorized" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting notification:", error)
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    )
  }
}
