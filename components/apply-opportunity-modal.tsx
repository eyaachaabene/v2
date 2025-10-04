"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2, Upload } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useApplyToOpportunity } from "@/hooks/use-opportunities"
import type { Opportunity } from "@/lib/models/Opportunity"

interface ApplyOpportunityModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  opportunity: Opportunity
  onSuccess?: () => void
}

export function ApplyOpportunityModal({
  open,
  onOpenChange,
  opportunity,
  onSuccess,
}: ApplyOpportunityModalProps) {
  const { apply, loading, error, success } = useApplyToOpportunity()
  
  const [coverLetter, setCoverLetter] = useState("")
  const [relevantExperience, setRelevantExperience] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [availabilityDescription, setAvailabilityDescription] = useState("")
  const [resumeUrl, setResumeUrl] = useState("")
  const [uploadingFile, setUploadingFile] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF or Word document')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setUploadingFile(true)

    try {
      // For now, we'll create a temporary URL
      // In production, you would upload to a storage service like AWS S3, Cloudinary, etc.
      const formData = new FormData()
      formData.append('file', file)
      
      // TODO: Replace with actual upload endpoint
      // const response = await fetch('/api/upload', {
      //   method: 'POST',
      //   body: formData,
      // })
      // const data = await response.json()
      // setResumeUrl(data.url)

      // For now, use a placeholder
      setResumeUrl(`https://example.com/uploads/${file.name}`)
      alert(`File "${file.name}" ready to upload. (Upload endpoint not yet configured)`)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload file')
    } finally {
      setUploadingFile(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await apply(opportunity._id?.toString() || "", {
        coverLetter,
        relevantExperience,
        availability: {
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          description: availabilityDescription,
        },
        resumeUrl,
      })

      // Reset form
      setCoverLetter("")
      setRelevantExperience("")
      setStartDate(undefined)
      setEndDate(undefined)
      setAvailabilityDescription("")
      setResumeUrl("")

      setTimeout(() => {
        onOpenChange(false)
        onSuccess?.()
      }, 1500)
    } catch (err) {
      // Error is handled by the hook
      console.error(err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply for {opportunity.title}</DialogTitle>
          <DialogDescription>
            Fill out the application form below. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <div className="mb-4 text-4xl">✅</div>
            <h3 className="text-xl font-semibold mb-2">Application Submitted!</h3>
            <p className="text-muted-foreground">
              Your application has been sent to the employer. You will be notified when they review it.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="coverLetter">Cover Letter / Message *</Label>
              <Textarea
                id="coverLetter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Introduce yourself and explain why you're a good fit for this opportunity..."
                rows={6}
                required
              />
              <p className="text-sm text-muted-foreground">
                Tell the employer about your interest and qualifications
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="relevantExperience">Relevant Experience</Label>
              <Textarea
                id="relevantExperience"
                value={relevantExperience}
                onChange={(e) => setRelevantExperience(e.target.value)}
                placeholder="Describe your relevant work experience, skills, and accomplishments..."
                rows={4}
              />
            </div>

            <div className="space-y-4">
              <Label>Availability</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Available From</Label>
                  <Input
                    type="date"
                    value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                      if (e.target.value) {
                        setStartDate(new Date(e.target.value))
                      } else {
                        setStartDate(undefined)
                      }
                    }}
                    min={format(new Date(), "yyyy-MM-dd")}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Available Until</Label>
                  <Input
                    type="date"
                    value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                      if (e.target.value) {
                        setEndDate(new Date(e.target.value))
                      } else {
                        setEndDate(undefined)
                      }
                    }}
                    min={startDate ? format(startDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="availabilityDescription">Availability Notes</Label>
                <Input
                  id="availabilityDescription"
                  value={availabilityDescription}
                  onChange={(e) => setAvailabilityDescription(e.target.value)}
                  placeholder="e.g., Available full-time, weekdays only, etc."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resumeUrl">Resume / CV (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="resumeUrl"
                  type="url"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  placeholder="https://example.com/my-resume.pdf"
                />
                <div className="relative">
                  <input
                    type="file"
                    id="resume-upload"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={() => document.getElementById('resume-upload')?.click()}
                    disabled={uploadingFile}
                  >
                    {uploadingFile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Upload your resume or provide a link to it
              </p>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-sm">
                {error}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Application
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
