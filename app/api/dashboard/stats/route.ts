import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth-middleware"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const token = await verifyToken(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const farmerId = new ObjectId(token.userId)

    // Get latest sensor readings
    const latestSensorReadings = await db
      .collection("sensor_readings")
      .find({ farmerId })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray()

    // Get active tasks count
    const activeTasks = await db.collection("tasks").countDocuments({
      farmerId,
      status: { $in: ["pending", "in_progress"] },
    })

    // Get overdue tasks count
    const overdueTasks = await db.collection("tasks").countDocuments({
      farmerId,
      status: "overdue",
    })

    // Get products count
    const productsCount = await db.collection("products").countDocuments({ farmerId })

    // Get recent activity (last 10 activities)
    const recentActivity = await db
      .collection("activities")
      .find({ farmerId })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray()

    return NextResponse.json({
      sensorReadings: latestSensorReadings,
      stats: {
        activeTasks,
        overdueTasks,
        productsCount,
      },
      recentActivity,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
