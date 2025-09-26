import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { SensorReading } from "@/lib/models/User"
import { ObjectId } from "mongodb"
import { verifyToken } from "@/lib/auth-middleware"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = await verifyToken(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    const db = await getDatabase()
    const readingsCollection = db.collection<SensorReading>("sensor_readings")

    // Build query
    const query: any = {
      sensorId: new ObjectId(params.id),
      farmerId: new ObjectId(token.userId),
    }

    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    const readings = await readingsCollection.find(query).sort({ timestamp: -1 }).limit(limit).toArray()

    return NextResponse.json({ readings })
  } catch (error) {
    console.error("[v0] Get sensor readings error:", error)
    return NextResponse.json({ error: "Failed to fetch sensor readings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const readingData = await request.json()

    const db = await getDatabase()
    const sensorsCollection = db.collection("iot_sensors")
    const readingsCollection = db.collection<SensorReading>("sensor_readings")

    // Find sensor
    const sensor = await sensorsCollection.findOne({
      sensorId: params.id,
    })

    if (!sensor) {
      return NextResponse.json({ error: "Sensor not found" }, { status: 404 })
    }

    // Check thresholds and generate alerts
    const alerts = []
    const value = readingData.value

    if (value < sensor.thresholds.min) {
      alerts.push({
        type: "threshold_exceeded",
        severity: "high" as const,
        message: `Value ${value} is below minimum threshold ${sensor.thresholds.min}`,
        acknowledged: false,
      })
    }

    if (value > sensor.thresholds.max) {
      alerts.push({
        type: "threshold_exceeded",
        severity: "high" as const,
        message: `Value ${value} is above maximum threshold ${sensor.thresholds.max}`,
        acknowledged: false,
      })
    }

    // Assess data quality
    let quality: "Good" | "Fair" | "Poor" = "Good"
    if (value >= sensor.thresholds.optimal.min && value <= sensor.thresholds.optimal.max) {
      quality = "Good"
    } else if (value >= sensor.thresholds.min && value <= sensor.thresholds.max) {
      quality = "Fair"
    } else {
      quality = "Poor"
    }

    const newReading: SensorReading = {
      sensorId: sensor._id,
      farmerId: sensor.farmerId,
      readings: {
        value: readingData.value,
        unit: readingData.unit,
        quality,
        batteryLevel: readingData.batteryLevel || 100,
        signalStrength: readingData.signalStrength || 100,
      },
      alerts,
      timestamp: new Date(),
      processed: false,
    }

    const result = await readingsCollection.insertOne(newReading)

    // Update sensor status
    await sensorsCollection.updateOne(
      { _id: sensor._id },
      {
        $set: {
          status: readingData.signalStrength > 50 ? "Online" : "Offline",
          "specifications.batteryLevel": readingData.batteryLevel || 100,
          "specifications.signalStrength": readingData.signalStrength || 100,
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json(
      {
        message: "Sensor reading recorded successfully",
        reading: { ...newReading, _id: result.insertedId },
        alerts,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Record sensor reading error:", error)
    return NextResponse.json({ error: "Failed to record sensor reading" }, { status: 500 })
  }
}
