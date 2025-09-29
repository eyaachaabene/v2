import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface Resource {
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
    bulkDiscounts?: { quantity: number; discountPercentage: number }[]
  }
  specifications: {
    brand?: string
    model?: string
    manufacturer?: string
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
    certifications?: string[]
  }
  availability: {
    status: string
    quantity: number
    leadTime: string
    shippingInfo: {
      methods: string[]
      costs: Record<string, number>
    }
  }
  tags: string[]
  supplierId: string
  createdAt: string
  updatedAt?: string
}

export function useUserResources() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserResources = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      
      if (!token) {
        setError('No authentication token found')
        return
      }

      const response = await fetch('/api/resources?userOnly=true', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch resources')
      }

      const data = await response.json()
      setResources(data.resources || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateResource = async (id: string, resourceData: Partial<Resource>) => {
    try {
      const token = localStorage.getItem('auth_token')
      
      if (!token) {
        toast.error('Please login first')
        return false
      }

      const response = await fetch(`/api/resources/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resourceData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update resource')
      }

      const data = await response.json()
      
      // Mettre à jour la liste locale
      setResources(prev => 
        prev.map(resource => 
          resource._id === id ? data.resource : resource
        )
      )

      toast.success('Resource updated successfully!')
      return true
    } catch (err: any) {
      toast.error(err.message || 'Failed to update resource')
      return false
    }
  }

  const deleteResource = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      
      if (!token) {
        toast.error('Please login first')
        return false
      }

      const response = await fetch(`/api/resources/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete resource')
      }

      // Supprimer de la liste locale
      setResources(prev => prev.filter(resource => resource._id !== id))

      toast.success('Resource deleted successfully!')
      return true
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete resource')
      return false
    }
  }

  useEffect(() => {
    fetchUserResources()
  }, [])

  return {
    resources,
    loading,
    error,
    refetch: fetchUserResources,
    updateResource,
    deleteResource
  }
}