"use client"

import { useState, useEffect } from "react"

export interface DashboardStats {
  totalRevenue: number
  totalExpenses: number
  activeTasks: number
  completedTasks: number
  averageSoilMoisture: number
  averageTemperature: number
  totalProducts: number
  totalSensors: number
  recentActivity: Array<{
    type: string
    message: string
    timestamp: string
  }>
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        console.log("[v0] Fetching dashboard stats from API...")
        const response = await fetch("/api/dashboard/stats")

        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard stats: ${response.statusText}`)
        }

        const data = await response.json()
        console.log("[v0] Dashboard stats fetched successfully:", data)
        setStats(data)
      } catch (err) {
        console.error("[v0] Error fetching dashboard stats:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch dashboard stats")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error, refetch: () => window.location.reload() }
}
