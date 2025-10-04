import { useState, useEffect } from "react"
import type { Opportunity } from "@/lib/models/Opportunity"

interface UseOpportunitiesOptions {
  type?: string
  location?: string
  urgency?: string
  search?: string
  page?: number
  limit?: number
  autoFetch?: boolean
}

interface OpportunitiesResponse {
  opportunities: Opportunity[]
  locations: string[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export function useOpportunities(options: UseOpportunitiesOptions = {}) {
  const {
    type = "all",
    location = "all",
    urgency = "all",
    search = "",
    page = 1,
    limit = 10,
    autoFetch = true,
  } = options

  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [locations, setLocations] = useState<string[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOpportunities = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      if (type !== "all") params.append("type", type)
      if (location !== "all") params.append("location", location)
      if (urgency !== "all") params.append("urgency", urgency)
      if (search) params.append("search", search)

      const response = await fetch(`/api/opportunities?${params}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch opportunities")
      }

      const data: OpportunitiesResponse = await response.json()
      
      setOpportunities(data.opportunities)
      setLocations(data.locations || [])
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Error fetching opportunities:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (autoFetch) {
      fetchOpportunities()
    }
  }, [type, location, urgency, search, page, limit])

  const refetch = () => {
    fetchOpportunities()
  }

  return {
    opportunities,
    locations,
    pagination,
    loading,
    error,
    refetch,
  }
}

export function useOpportunity(id: string) {
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOpportunity = async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/opportunities/${id}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch opportunity")
      }

      const data = await response.json()
      setOpportunity(data.opportunity)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Error fetching opportunity:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOpportunity()
  }, [id])

  return {
    opportunity,
    loading,
    error,
    refetch: fetchOpportunity,
  }
}

export function useApplyToOpportunity() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const apply = async (opportunityId: string, applicationData: any) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Get token from localStorage
      const token = localStorage.getItem('auth_token')
      
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      
      // Add Authorization header if token exists
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const response = await fetch(`/api/opportunities/${opportunityId}/apply`, {
        method: "POST",
        headers,
        credentials: "include", // Include cookies in request
        body: JSON.stringify(applicationData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit application")
      }

      setSuccess(true)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    apply,
    loading,
    error,
    success,
  }
}

export function useApplicationStatus(opportunityId: string) {
  const [applied, setApplied] = useState(false)
  const [application, setApplication] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkStatus = async () => {
    if (!opportunityId) return

    setLoading(true)

    try {
      // Get token from localStorage
      const token = localStorage.getItem('auth_token')
      
      const headers: Record<string, string> = {}
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const response = await fetch(`/api/opportunities/${opportunityId}/apply`, {
        headers,
        credentials: "include", // Include cookies in request
      })
      
      // If unauthorized, user is not logged in - silently fail
      if (response.status === 401) {
        setApplied(false)
        setApplication(null)
        setLoading(false)
        return
      }

      const data = await response.json()

      setApplied(data.applied)
      setApplication(data.application)
    } catch (err) {
      // Silently fail - don't show errors for application status checks
      setApplied(false)
      setApplication(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [opportunityId])

  return {
    applied,
    application,
    loading,
    refetch: checkStatus,
  }
}

export function useSaveOpportunity() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = async (opportunityId: string, notes?: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/opportunities/saved", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ opportunityId, notes }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save opportunity")
      }

      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const remove = async (opportunityId: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/opportunities/saved?opportunityId=${opportunityId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove saved opportunity")
      }

      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    save,
    remove,
    loading,
    error,
  }
}
