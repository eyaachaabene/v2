"use client"

import { useState, useEffect } from "react"

export interface SensorReading {
  timestamp: string
  value: number
  unit: string
}

export interface IoTSensor {
  _id: string
  name: string
  type: "soil_moisture" | "temperature" | "humidity" | "ph" | "light"
  location: string
  status: "online" | "offline" | "maintenance"
  lastReading: SensorReading
  batteryLevel: number
  userId: string
  createdAt: string
  updatedAt: string
}

export function useSensors() {
  const [sensors, setSensors] = useState<IoTSensor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSensors() {
      try {
        console.log("[v0] Fetching sensors from API...")
        const response = await fetch("/api/iot/sensors")

        if (!response.ok) {
          throw new Error(`Failed to fetch sensors: ${response.statusText}`)
        }

        const data = await response.json()
        console.log("[v0] Sensors fetched successfully:", data.length, "sensors")
        setSensors(data)
      } catch (err) {
        console.error("[v0] Error fetching sensors:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch sensors")
      } finally {
        setLoading(false)
      }
    }

    fetchSensors()
  }, [])

  return { sensors, loading, error, refetch: () => window.location.reload() }
}
