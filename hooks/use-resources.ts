"use client"

import { useState, useEffect } from "react"

export interface Resource {
  _id: string
  title: string
  description: string
  type: string
  category: string
  provider: {
    profile: {
      firstName: string
      lastName: string
    }
    role: string
  }
  location: {
    governorate: string
    city: string
    coordinates: {
      lat: number
      lng: number
    }
    remote: boolean
  }
  compensation: {
    type: string
    amount: number
    currency: string
    period: string
    benefits: string[]
  }
  requirements: {
    experience: string
    skills: string[]
    education: string
  }
  schedule: {
    startDate: string
    endDate: string
    duration: string
    workingHours: string
    flexible: boolean
  }
  status: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export function useResources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchResources() {
      setLoading(true)
      try {
        console.log("[v0] Fetching resources from API...")
        const params = new URLSearchParams();
        if (category && category !== 'all') params.append('category', category);
        if (governorate && governorate !== 'all') params.append('governorate', governorate);
        
        const response = await fetch(`/api/resources?${params.toString()}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch resources: ${response.statusText}`)
        }

        const data = await response.json()
        console.log("[v0] Resources fetched successfully:", data.resources.length, "resources")
        setResources(data.resources)
      } catch (err) {
        console.error("[v0] Error fetching resources:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch resources")
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [category, governorate])
  }, [])

  return { 
    resources, 
    loading, 
    error, 
    setResources,
    refetch: () => window.location.reload() 
  }
}