"use client"

import { useState, useEffect } from "react"

export interface Resource {
  _id: string
  name: string
  description: string
  category: string
  type: string
  images: string[]
  pricing: {
    price: number
    unit: string
    currency: string
    minimumOrder: number
    bulkDiscounts?: {
      quantity: number
      discountPercentage: number
    }[]
  }
  specifications: {
    brand: string
    model: string
    manufacturer: string
    weight?: number
    dimensions?: {
      length: number
      width: number
      height: number
      unit: string
    }
    activeIngredients?: string[]
    composition?: any
    applicationMethod?: string
    safetyPeriod?: string
    certifications: string[]
  }
  availability: {
    status: string
    quantity: number
    leadTime: string
    shippingInfo: {
      methods: string[]
      costs: any
    }
  }
  location: {
    governorate: string
    city: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  supplier: {
    profile: {
      firstName: string
      lastName: string
    }
    role: string
  }
  ratings: {
    averageRating: number
    totalReviews: number
    ratingDistribution: {
      5: number
      4: number
      3: number
      2: number
      1: number
    }
  }
  tags: string[]
  createdAt: string
  updatedAt: string
}

export function useResources(category?: string, governorate?: string) {
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

  return { 
    resources, 
    loading, 
    error, 
    setResources,
    refetch: () => window.location.reload() 
  }
}