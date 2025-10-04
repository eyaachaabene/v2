"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Users, Briefcase, Clock, DollarSign, Bookmark, BookmarkCheck } from "lucide-react"
import type { Opportunity } from "@/lib/models/Opportunity"
import { ApplyOpportunityModal } from "./apply-opportunity-modal"
import { useApplicationStatus, useSaveOpportunity } from "@/hooks/use-opportunities"
import { cn } from "@/lib/utils"

interface OpportunityCardProps {
  opportunity: Opportunity
  onApplySuccess?: () => void
}

export function OpportunityCard({ opportunity, onApplySuccess }: OpportunityCardProps) {
  const [showApplyModal, setShowApplyModal] = useState(false)
  const { applied, application } = useApplicationStatus(opportunity._id?.toString() || "")
  const { save, remove, loading: saveLoading } = useSaveOpportunity()
  const [isSaved, setIsSaved] = useState(false)

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      seasonal_work: "bg-green-100 text-green-800 border-green-200",
      full_time: "bg-blue-100 text-blue-800 border-blue-200",
      part_time: "bg-purple-100 text-purple-800 border-purple-200",
      technical_work: "bg-orange-100 text-orange-800 border-orange-200",
      training: "bg-blue-100 text-blue-800 border-blue-200",
      workshop: "bg-blue-100 text-blue-800 border-blue-200",
      contract: "bg-yellow-100 text-yellow-800 border-yellow-200",
    }
    return colors[type] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const handleSaveToggle = async () => {
    try {
      if (isSaved) {
        await remove(opportunity._id?.toString() || "")
        setIsSaved(false)
      } else {
        await save(opportunity._id?.toString() || "")
        setIsSaved(true)
      }
    } catch (err) {
      console.error("Error toggling save:", err)
    }
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return ""
    const d = new Date(date)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - d.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex flex-wrap gap-2">
              <Badge className={getTypeColor(opportunity.type)}>
                <Briefcase className="h-3 w-3 mr-1" />
                {opportunity.jobType || opportunity.type}
              </Badge>
              {opportunity.urgency === 'urgent' && (
                <Badge variant="destructive">Urgent</Badge>
              )}
              {opportunity.featured && (
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  Featured
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSaveToggle}
              disabled={saveLoading}
            >
              {isSaved ? (
                <BookmarkCheck className="h-5 w-5 text-primary" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </Button>
          </div>
          
          <h3 className="text-xl font-semibold mb-2">{opportunity.title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
            {opportunity.description}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{opportunity.location?.city || ''}{opportunity.location?.city && opportunity.location?.governorate ? ', ' : ''}{opportunity.location?.governorate || 'Location not specified'}</span>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{opportunity.duration?.description || (opportunity.duration?.value && opportunity.duration?.type ? `${opportunity.duration.value} ${opportunity.duration.type}` : 'Duration not specified')}</span>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>
                {opportunity.compensation?.payRate || 
                 (opportunity.compensation?.amount && opportunity.compensation?.currency ? `${opportunity.compensation.amount} ${opportunity.compensation.currency}` : 'Compensation not specified')}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{opportunity.currentApplicants || 0} applicants</span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground col-span-2">
              <Calendar className="h-4 w-4" />
              <span>Posted {formatDate(opportunity.createdAt)}</span>
            </div>
          </div>

          {opportunity.requirements?.skills && opportunity.requirements.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {opportunity.requirements.skills.slice(0, 4).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {opportunity.requirements.skills.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{opportunity.requirements.skills.length - 4} more
                </Badge>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {applied ? (
              <Button
                className="flex-1"
                variant="outline"
                disabled
              >
                Applied
                {application?.status && (
                  <Badge className="ml-2" variant="secondary">
                    {application.status}
                  </Badge>
                )}
              </Button>
            ) : (
              <Button
                className="flex-1"
                onClick={() => setShowApplyModal(true)}
              >
                Apply Now
              </Button>
            )}
            <Button variant="outline">View Details</Button>
          </div>
        </CardContent>
      </Card>

      <ApplyOpportunityModal
        open={showApplyModal}
        onOpenChange={setShowApplyModal}
        opportunity={opportunity}
        onSuccess={onApplySuccess}
      />
    </>
  )
}
