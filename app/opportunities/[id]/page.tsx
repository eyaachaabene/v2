"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DashboardNav } from "@/components/dashboard-nav"
import { OpportunityApplications } from "@/components/opportunity-applications"
import { 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Clock, 
  Briefcase, 
  Phone, 
  Mail,
  ArrowLeft,
  Loader2 
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

interface Opportunity {
  _id: string
  title: string
  description: string
  type: string
  provider?: {
    _id: string
    profile?: {
      firstName?: string
      lastName?: string
    }
  }
  providerId?: string
  location: {
    governorate: string
    city: string
    address?: string
  }
  requirements: string[]
  compensation: {
    type: string
    amount: number
    currency: string
  }
  duration: string
  startDate?: string
  applicationDeadline: string
  positions: number | {
    available: number
    filled: number
  }
  contactInfo: {
    phone?: string
    email?: string
  }
  status: string
  createdAt: string
}

export default function OpportunityDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOpportunity()
  }, [params.id])

  const fetchOpportunity = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch(`/api/opportunities/${params.id}`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      })

      if (response.ok) {
        const data = await response.json()
        setOpportunity(data.opportunity)
      } else {
        toast.error("Opportunity not found")
        router.push('/opportunities')
      }
    } catch (error) {
      console.error('Error fetching opportunity:', error)
      toast.error("Failed to load opportunity")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "seasonal_work":
        return "bg-green-100 text-green-800 border-green-200"
      case "training":
      case "workshop":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "part_time_job":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "technical_work":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    )
  }

  if (!opportunity) {
    return null
  }

  // Check ownership using either provider._id or providerId
  const providerId = opportunity.provider?._id || opportunity.providerId
  const isOwner = user && providerId === user._id
  const canViewApplications = isOwner && (user.role === 'farmer' || user.role === 'supplier')

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/opportunities')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Opportunities
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Main Opportunity Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getTypeColor(opportunity.type)}>
                        {opportunity.type.replace(/_/g, ' ').toUpperCase()}
                      </Badge>
                      {opportunity.status === 'active' && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl mb-2">{opportunity.title}</CardTitle>
                    <p className="text-muted-foreground">
                      {opportunity.provider?.profile?.firstName && opportunity.provider?.profile?.lastName 
                        ? `by ${opportunity.provider.profile.firstName} ${opportunity.provider.profile.lastName}`
                        : 'Provider information not available'}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{opportunity.description}</p>
                </div>

                {opportunity.requirements && opportunity.requirements.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Requirements</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {opportunity.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">
                        {opportunity.location.city}, {opportunity.location.governorate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Compensation</p>
                      <p className="text-sm text-muted-foreground">
                        {opportunity.compensation.amount} {opportunity.compensation.currency} / {opportunity.compensation.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Positions</p>
                      <p className="text-sm text-muted-foreground">
                        {typeof opportunity.positions === 'number' 
                          ? `${opportunity.positions} available`
                          : `${opportunity.positions.available} available${opportunity.positions.filled > 0 ? ` (${opportunity.positions.filled} filled)` : ''}`
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Duration</p>
                      <p className="text-sm text-muted-foreground">{opportunity.duration || 'Not specified'}</p>
                    </div>
                  </div>
                  {opportunity.startDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Start Date</p>
                        <p className="text-sm text-muted-foreground">{formatDate(opportunity.startDate)}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Application Deadline</p>
                      <p className="text-sm text-muted-foreground">{formatDate(opportunity.applicationDeadline)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Applications Section - Only visible to opportunity owner */}
            {canViewApplications && (
              <OpportunityApplications 
                opportunityId={opportunity._id} 
                opportunityTitle={opportunity.title}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {opportunity.contactInfo.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${opportunity.contactInfo.email}`} className="text-sm hover:underline">
                      {opportunity.contactInfo.email}
                    </a>
                  </div>
                )}
                {opportunity.contactInfo.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${opportunity.contactInfo.phone}`} className="text-sm hover:underline">
                      {opportunity.contactInfo.phone}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Posted on</p>
                  <p className="font-medium">{formatDate(opportunity.createdAt)}</p>
                </div>
                {opportunity.location.address && (
                  <div>
                    <p className="text-muted-foreground">Address</p>
                    <p className="font-medium">{opportunity.location.address}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
