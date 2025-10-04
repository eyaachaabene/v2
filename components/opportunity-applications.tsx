"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Users, Mail, Phone, MapPin, Calendar, FileText, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Application {
  _id: string
  applicant: {
    _id: string
    profile: {
      firstName: string
      lastName: string
      avatar?: string
      phone?: string
    }
    email: string
    role: string
  }
  coverLetter: string
  status: 'pending' | 'accepted' | 'rejected'
  appliedAt: string
}

interface OpportunityApplicationsProps {
  opportunityId: string
  opportunityTitle: string
}

export function OpportunityApplications({ opportunityId, opportunityTitle }: OpportunityApplicationsProps) {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [opportunityId])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch(`/api/opportunities/${opportunityId}/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications || [])
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast.error("Failed to load applications")
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (applicationId: string, status: 'accepted' | 'rejected') => {
    try {
      setUpdatingStatus(true)
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch(`/api/opportunity_applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        toast.success(`Application ${status}!`)
        setSelectedApplication(null)
        fetchApplications()
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to update application")
      }
    } catch (error) {
      console.error('Error updating application:', error)
      toast.error("An error occurred")
    } finally {
      setUpdatingStatus(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Applications ({applications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No applications yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <div 
                  key={application._id} 
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedApplication(application)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={application.applicant.profile.avatar} />
                        <AvatarFallback>
                          {application.applicant.profile.firstName[0]}
                          {application.applicant.profile.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">
                          {application.applicant.profile.firstName} {application.applicant.profile.lastName}
                        </h4>
                        <p className="text-sm text-muted-foreground capitalize">{application.applicant.role}</p>
                      </div>
                    </div>
                    {getStatusBadge(application.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(application.appliedAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span>{application.applicant.email}</span>
                    </div>
                  </div>
                  {application.coverLetter && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {application.coverLetter}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Details Dialog */}
      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedApplication.applicant.profile.avatar} />
                  <AvatarFallback className="text-lg">
                    {selectedApplication.applicant.profile.firstName[0]}
                    {selectedApplication.applicant.profile.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">
                    {selectedApplication.applicant.profile.firstName} {selectedApplication.applicant.profile.lastName}
                  </h3>
                  <Badge className="capitalize mb-2">{selectedApplication.applicant.role}</Badge>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{selectedApplication.applicant.email}</span>
                    </div>
                    {selectedApplication.applicant.profile.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{selectedApplication.applicant.profile.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Applied on {formatDate(selectedApplication.appliedAt)}</span>
                    </div>
                  </div>
                </div>
                {getStatusBadge(selectedApplication.status)}
              </div>

              {selectedApplication.coverLetter && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Cover Letter
                  </h4>
                  <div className="bg-accent/50 rounded-lg p-4">
                    <p className="text-sm whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                  </div>
                </div>
              )}

              {selectedApplication.status === 'pending' && (
                <div className="flex gap-2 justify-end pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => updateApplicationStatus(selectedApplication._id, 'rejected')}
                    disabled={updatingStatus}
                    className="text-destructive hover:text-destructive"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => updateApplicationStatus(selectedApplication._id, 'accepted')}
                    disabled={updatingStatus}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
