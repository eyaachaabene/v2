import type { ObjectId } from "mongodb"

export interface IoTSensor {
  _id?: ObjectId
  sensorId: string // unique identifier
  farmerId: ObjectId
  name: string
  type: "soil_moisture" | "temperature" | "humidity" | "ph" | "light" | "weather"
  location: {
    field: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  }
  status: "active" | "inactive" | "maintenance" | "error"
  batteryLevel?: number
  lastReading?: Date
  calibrationDate?: Date
  installationDate: Date
  createdAt: Date
  updatedAt: Date
}

export interface SensorReading {
  _id?: ObjectId
  sensorId: string
  farmerId: ObjectId
  readings: {
    [key: string]: number // flexible for different sensor types
  }
  timestamp: Date
  quality: "good" | "fair" | "poor" | "error"
}
