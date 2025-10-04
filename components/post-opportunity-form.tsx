"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, X, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const TUNISIAN_GOVERNORATES = [
  "Tunis", "Ariana", "Ben Arous", "Manouba", "Nabeul", "Zaghouan", "Bizerte",
  "Béja", "Jendouba", "Kef", "Siliana", "Sousse", "Monastir", "Mahdia",
  "Sfax", "Kairouan", "Kasserine", "Sidi Bouzid", "Gabès", "Medenine",
  "Tataouine", "Gafsa", "Tozeur", "Kebili"
]

const JOB_TYPES = [
  "Seasonal Work",
  "Full-time",
  "Part-time",
  "Contract",
  "Temporary",
  "Internship"
]

const COMMON_SKILLS = [
  "Harvesting",
  "Physical Work",
  "Agriculture",
  "Greenhouse",
  "Irrigation",
  "Organic Farming",
  "Quality Control",
  "Technical",
  "IoT",
  "Installation",
  "Leadership",
  "Business"
]

interface PostOpportunityFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function PostOpportunityForm({ onSuccess, onCancel }: PostOpportunityFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "seasonal_work",
    jobType: "Seasonal Work",
    urgency: "normal" as "urgent" | "normal" | "low_priority",
    governorate: "",
    city: "",
    address: "",
    paymentType: "daily",
    amount: "",
    payRate: "",
    durationType: "weeks",
    durationValue: "",
    durationDescription: "",
    availablePositions: "1",
    skills: [] as string[],
    experienceLevel: "",
    experienceYears: "",
    education: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    applicationDeadline: undefined as Date | undefined,
    maxApplicants: "",
  })

  const [customSkill, setCustomSkill] = useState("")

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addSkill = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      handleInputChange("skills", [...formData.skills, skill])
    }
    setCustomSkill("")
  }

  const removeSkill = (skill: string) => {
    handleInputChange("skills", formData.skills.filter(s => s !== skill))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const opportunityData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        jobType: formData.jobType,
        urgency: formData.urgency,
        location: {
          governorate: formData.governorate,
          city: formData.city,
          address: formData.address,
        },
        compensation: {
          type: formData.paymentType,
          amount: formData.amount ? parseFloat(formData.amount) : undefined,
          currency: "TND",
          payRate: formData.payRate,
        },
        duration: {
          type: formData.durationType,
          value: formData.durationValue ? parseInt(formData.durationValue) : 1,
          description: formData.durationDescription,
        },
        positions: {
          available: parseInt(formData.availablePositions) || 1,
        },
        requirements: {
          skills: formData.skills,
          experienceLevel: formData.experienceLevel || undefined,
          experienceYears: formData.experienceYears ? parseInt(formData.experienceYears) : undefined,
          education: formData.education || undefined,
        },
        contactInfo: {
          name: formData.contactName || undefined,
          email: formData.contactEmail || undefined,
          phone: formData.contactPhone || undefined,
        },
        startDate: formData.startDate?.toISOString(),
        endDate: formData.endDate?.toISOString(),
        applicationDeadline: formData.applicationDeadline?.toISOString(),
        maxApplicants: formData.maxApplicants ? parseInt(formData.maxApplicants) : undefined,
      }

      const response = await fetch("/api/opportunities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(opportunityData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create opportunity")
      }

      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Provide the main details about the opportunity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="e.g., Help with Olive Harvest"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe the opportunity, responsibilities, and requirements..."
              rows={5}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jobType">Job Type *</Label>
              <Select
                value={formData.jobType}
                onValueChange={(value) => {
                  handleInputChange("jobType", value)
                  handleInputChange("type", value.toLowerCase().replace(/-/g, "_"))
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency Level</Label>
              <Select
                value={formData.urgency}
                onValueChange={(value: any) => handleInputChange("urgency", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low_priority">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="governorate">Governorate *</Label>
              <Select
                value={formData.governorate}
                onValueChange={(value) => handleInputChange("governorate", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select governorate" />
                </SelectTrigger>
                <SelectContent>
                  {TUNISIAN_GOVERNORATES.map((gov) => (
                    <SelectItem key={gov} value={gov}>
                      {gov}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="Enter city"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Detailed Address (Optional)</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Enter detailed address"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compensation & Duration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentType">Payment Type</Label>
              <Select
                value={formData.paymentType}
                onValueChange={(value) => handleInputChange("paymentType", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="salary">Salary</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (TND)</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                placeholder="e.g., 25"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payRate">Pay Rate Description</Label>
              <Input
                id="payRate"
                value={formData.payRate}
                onChange={(e) => handleInputChange("payRate", e.target.value)}
                placeholder="e.g., 25 TND/day"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="durationType">Duration Type</Label>
              <Select
                value={formData.durationType}
                onValueChange={(value) => handleInputChange("durationType", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">Days</SelectItem>
                  <SelectItem value="weeks">Weeks</SelectItem>
                  <SelectItem value="months">Months</SelectItem>
                  <SelectItem value="seasonal">Seasonal</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="durationValue">Duration Value</Label>
              <Input
                id="durationValue"
                type="number"
                value={formData.durationValue}
                onChange={(e) => handleInputChange("durationValue", e.target.value)}
                placeholder="e.g., 2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="durationDescription">Duration Description</Label>
              <Input
                id="durationDescription"
                value={formData.durationDescription}
                onChange={(e) => handleInputChange("durationDescription", e.target.value)}
                placeholder="e.g., 2-3 weeks"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Skills</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Select onValueChange={addSkill}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select common skills" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_SKILLS.map((skill) => (
                    <SelectItem key={skill} value={skill}>
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2 flex-1">
                <Input
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  placeholder="Add custom skill"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addSkill(customSkill)
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => addSkill(customSkill)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experienceLevel">Experience Level</Label>
              <Select
                value={formData.experienceLevel}
                onValueChange={(value) => handleInputChange("experienceLevel", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="experienced">Experienced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experienceYears">Years of Experience</Label>
              <Input
                id="experienceYears"
                type="number"
                value={formData.experienceYears}
                onChange={(e) => handleInputChange("experienceYears", e.target.value)}
                placeholder="e.g., 2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="availablePositions">Number of Positions *</Label>
              <Input
                id="availablePositions"
                type="number"
                value={formData.availablePositions}
                onChange={(e) => handleInputChange("availablePositions", e.target.value)}
                placeholder="e.g., 5"
                required
                min="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="education">Education Requirements</Label>
            <Input
              id="education"
              value={formData.education}
              onChange={(e) => handleInputChange("education", e.target.value)}
              placeholder="e.g., No specific requirements"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dates & Deadlines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => handleInputChange("startDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? format(formData.endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => handleInputChange("endDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Application Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.applicationDeadline && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.applicationDeadline ? format(formData.applicationDeadline, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.applicationDeadline}
                    onSelect={(date) => handleInputChange("applicationDeadline", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxApplicants">Maximum Number of Applicants (Optional)</Label>
            <Input
              id="maxApplicants"
              type="number"
              value={formData.maxApplicants}
              onChange={(e) => handleInputChange("maxApplicants", e.target.value)}
              placeholder="Leave empty for unlimited"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>How applicants can reach you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactName">Contact Name</Label>
              <Input
                id="contactName"
                value={formData.contactName}
                onChange={(e) => handleInputChange("contactName", e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                placeholder="your@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                placeholder="+216 XX XXX XXX"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex gap-4 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Post Opportunity
        </Button>
      </div>
    </form>
  )
}
