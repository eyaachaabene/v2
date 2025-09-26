import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { IoTSensor } from "@/lib/models/User"
import { ObjectId } from "mongodb"
import { verifyToken } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  try {
    const token = await verifyToken(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const sensorsCollection = db.collection<IoTSensor>("iot_sensors")

    const sensors = await sensorsCollection
      .find({
        farmerId: new ObjectId(token.userId),
        isActive: true,
      })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ sensors })
  } catch (error) {
    console.error("[v0] Get sensors error:", error)
    return NextResponse.json({ error: "Failed to fetch sensors" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await verifyToken(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sensorData = await request.json()

    const db = await getDatabase()
    const sensorsCollection = db.collection<IoTSensor>("iot_sensors")

    // Check if sensor ID already exists
    const existingSensor = await sensorsCollection.findOne({
      sensorId: sensorData.sensorId,
    })

    if (existingSensor) {
      return NextResponse.json({ error: "Sensor ID already exists" }, { status: 400 })
    }

    const newSensor: IoTSensor = {
      ...sensorData,
      farmerId: new ObjectId(token.userId),
      status: "Offline",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await sensorsCollection.insertOne(newSensor)

    return NextResponse.json(
      {
        message: "Sensor registered successfully",
        sensor: { ...newSensor, _id: result.insertedId },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Register sensor error:", error)
    return NextResponse.json({ error: "Failed to register sensor" }, { status: 500 })
  }
}
