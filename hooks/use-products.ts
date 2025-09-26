"use client"

import { useState, useEffect } from "react"

export interface Product {
  _id: string
  name: string
  description: string
  pricing: {
    price: number
    unit: string
    currency: string
  }
  category: string
  subcategory?: string
  farmer: {
    name: string
    rating: number
    reviews: number
  }
  images: string[]
  availability: {
    status: "In Stock" | "Limited" | "Out of Stock" | "Seasonal"
    quantity: number
  }
  location: {
    governorate: string
    city: string
    coordinates: {
      latitude: number
      longitude: number
    }
  }
  tags: string[]
  createdAt: string
  updatedAt: string
}

export function useProducts(category?: string, governorate?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      try {
        console.log("[v0] Fetching products from API...")
        const params = new URLSearchParams();
        if (category && category !== 'all') params.append('category', category);
        if (governorate && governorate !== 'all') params.append('governorate', governorate);

        const response = await fetch(`/api/products?${params.toString()}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.statusText}`)
        }

        const data = await response.json()
        console.log("[v0] Products fetched successfully:", data.products.length, "products")
        setProducts(data.products)
      } catch (err) {
        console.error("[v0] Error fetching products:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch products")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [category, governorate])

  return { 
    products, 
    loading, 
    error, 
    setProducts,
    refetch: () => window.location.reload() 
  }
}
